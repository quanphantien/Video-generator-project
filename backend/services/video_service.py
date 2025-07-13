from datetime import datetime
import os
from pathlib import Path
import shutil
from typing import List
from uuid import uuid4

from sqlalchemy import UUID
from dependencies.auth_config import get_user_id_from_token
from config.config import settings
from fastapi import Depends, HTTPException
from httplib2 import Credentials
from jose import JWTError
import jwt
import numpy as np
import requests
from dto.video_dto import VideoEditRequest, VideoRequest, VideoResponse, VideoUploadRequest, VideoUploadResponse
from moviepy.video.VideoClip import ImageClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.audio import AudioClip
from moviepy.video.compositing.CompositeVideoClip import concatenate_videoclips
from moviepy import VideoFileClip, TextClip, CompositeVideoClip, CompositeAudioClip
from sqlalchemy.orm import Session


from models.video import Video
from services.cloudary import upload_video_to_cloudinary
from services.project_service import create_project

def generate_video(request: VideoRequest, db: Session , user_id: str) -> VideoResponse:
    name_of_video = request.video_name
    min_duration = request.min_duration_per_picture
    base_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.join(base_dir, 'temp_images')
    audio_dir = os.path.join(base_dir, 'temp_audio')
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_video = os.path.join(base_dir, f"{name_of_video}_{user_id}_{date_str}.mp4")
    try:
        image_files, audio_files = download_files(request.images_url, request.audio_url, images_dir, audio_dir)
        
        if not image_files or not audio_files:
            raise Exception("Failed to download required files")

        video_path = create_video_from_pairs(image_files, audio_files, output_video, min_duration)
        print(f"=== Video Created: {video_path}")

        uploaded_url = upload_video_to_cloudinary(Path(video_path))
        print(f"=== Uploaded to Cloudinary: {uploaded_url}")
        new_video = Video(
            id=uuid4(),
            title=name_of_video,
            url=uploaded_url,
            thumnail_url="",  # nếu bạn có ảnh thumbnail thì cập nhật ở đây
            previous_version_url=None,
            user_id=user_id
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)
        print(request.audio_url)
        create_project(
            video_url= uploaded_url , 
            audio_urls= request.audio_url , 
            image_urls= request.images_url, 
            thumbnail= "" , 
            user_id=user_id , 
            db=db)

        return VideoResponse(
            video_id=str(new_video.id),
            video_url=new_video.url,
            name=new_video.title
        )

    except Exception as e:
        print(f"=== Error during video generation: {e} ===")
        raise e  # hoặc raise HTTPException nếu bạn đang trong FastAPI context

    finally:
        cleanup_directories(images_dir, audio_dir)
        print("=== Temporary files cleaned up ===")
def create_video_from_pairs(image_files: List[str], audio_files: List[str], 
                           output_path: str, min_duration: float = 2):
    """
    Creates a video from image-audio pairs.
    """
    # Check if we have matching numbers of images and audio files
    if len(image_files) != len(audio_files):
        print(f"Warning: {len(image_files)} images but {len(audio_files)} audio files")
        # Use the minimum number to avoid index errors
        min_count = min(len(image_files), len(audio_files))
        image_files = image_files[:min_count]
        audio_files = audio_files[:min_count]
        print(f"Using first {min_count} files from each")

    if not image_files or not audio_files:
        raise Exception("No valid image-audio pairs found")

    print(f"\nCreating video with {len(image_files)} image-audio pairs...")

    # Create clips for each image-audio pair
    clips = []
    total_duration = 0

    for i, (img_path, audio_path) in enumerate(zip(image_files, audio_files)):
        print(f"\nProcessing pair {i+1}/{len(image_files)}:")
        print(f"Image: {os.path.basename(img_path)}")
        print(f"Audio: {os.path.basename(audio_path)}")
        
        try:
            audio_clip = AudioFileClip(audio_path)
            audio_duration = audio_clip.duration
            print(f"  Audio duration: {audio_duration:.2f}s")
            # Set frame duration (max of audio duration and minimum duration)
            frame_duration = max(audio_duration, min_duration)
            print(f"  Frame duration: {frame_duration:.2f}s")
            
            # Create image clip with the calculated duration
            img_clip = ImageClip(img_path).with_duration(frame_duration)
            
            # Handle audio duration
            if audio_duration < frame_duration:
                silence_duration = frame_duration - audio_duration  
                silence = create_silence_audio(silence_duration, fps=audio_clip.fps)
                extended_audio = CompositeAudioClip([audio_clip, silence])
            else:
                extended_audio = audio_clip
            
            img_clip = img_clip.with_audio(extended_audio)
            clips.append(img_clip)
            
            total_duration += frame_duration
            print(f"  ✓ Frame {i+1} ready")
            
        except Exception as e:
            print(f"  ✗ Error processing pair {i+1}: {e}")
            continue

    if not clips:
        raise Exception("No valid clips were created")

    print(f"\nTotal expected duration: {total_duration:.2f}s")
    print("Combining all frames...")
    
    final_video = concatenate_videoclips(clips, method="compose")
    
    print(f"Final video duration: {final_video.duration:.2f}s")
    print(f"Writing video to: {output_path}")

    final_video.write_videofile(
    output_path,
   
    fps=24,
)

    print(f"\n✓ Video created successfully: {output_path}")
    print(f"✓ Duration: {final_video.duration:.2f} seconds")
    print(f"✓ Frames: {len(clips)}")

    # Clean up clips
    final_video.close()
    for clip in clips:
        clip.close()

    return output_path


def edit_video(video_id: str, request: VideoEditRequest, db: Session) -> VideoResponse:
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    video.url = request.url
    video.title = request.title
    db.commit()
    return VideoResponse(
        video_id=str(video.id) , 
        name=request.title,
        video_url=request.url
    )
def upload_video(request: VideoUploadRequest, db: Session, user_id: str) -> VideoUploadResponse:

        # Tạo đối tượng Video với tất cả các trường cần thiết
        video = Video(
            id=str(uuid4()),
            title=request.title,
            url=request.url,
            thumnail_url=f"{request.url}/thumbnail.jpg",  # Giả định thumbnail từ URL, cần điều chỉnh
            previous_version_url=None,  # Có thể null theo định nghĩa
            youtube_id=request.youtube_id,  # Lấy từ request
            user_id=user_id  # Gán user_id từ tham số
        )

        # Thêm video vào session và commit
        db.add(video)
        db.commit()
        db.refresh(video) 

        return VideoUploadResponse(
            title=video.title,
            url=video.url,
            youtube_id=video.youtube_id
        )


def get_user_videos(db: Session , user_id: str) -> list[VideoResponse]:
    videos = db.query(Video).filter(Video.user_id == user_id).all()
    return [
            VideoResponse(video_url=video.url, name=video.title , video_id= str(video.id))
            for video in videos]

def delete_video(video_id: str, user_id : str ,  db: Session) -> bool:
        video = db.query(Video).filter(Video.id == video_id, Video.user_id == user_id).first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found or unauthorized")

        db.delete(video)
        db.commit()

        return True




def download_files(image_urls: List[str], audio_urls: List[str], images_dir: str, audio_dir: str):
    """
    Downloads images and audio files from given URLs and saves them to the specified directories.
    Returns two lists: local image file paths and local audio file paths.
    """
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(audio_dir, exist_ok=True)

    local_image_files = []
    local_audio_files = []

    # Download images
    print("Downloading images...")
    for i, url in enumerate(image_urls):
        filename = f"image_{i+1:03d}.jpg"  # Use sequential naming
        local_path = os.path.join(images_dir, filename)
        
        print(f"  Downloading image {i+1}/{len(image_urls)}: {url}")
        try:
            r = requests.get(url, stream=True)
            r.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            local_image_files.append(local_path)
            print(f"  ✓ Saved: {filename}")
        except Exception as e:
            print(f"  ✗ Failed to download image {i+1}: {e}")
            continue
    print("\nDownloading audio files...")
    for i, url in enumerate(audio_urls):
        filename = f"audio_{i+1:03d}.mp3"  # Use sequential naming
        local_path = os.path.join(audio_dir, filename)
        
        print(f"  Downloading audio {i+1}/{len(audio_urls)}: {url}")
        try:
            r = requests.get(url, stream=True)
            r.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            local_audio_files.append(local_path)
            print(f"  ✓ Saved: {filename}")
        except Exception as e:
            print(f"  ✗ Failed to download audio {i+1}: {e}")
            continue

    return local_image_files, local_audio_files


def create_silence_audio(duration, fps=22050):
    """
    Create a silent audio clip of specified duration
    """
    def make_frame(t):
        return np.array([0.0, 0.0])  # Stereo silence
    
    return AudioClip(make_frame, duration=duration, fps=fps)

def cleanup_directories(images_dir: str, audio_dir: str):
    """
    Removes the downloaded images and audio directories.
    """
    print("\nCleaning up downloaded files...")
    try:
        if os.path.exists(images_dir):
            shutil.rmtree(images_dir)
            print(f"  ✓ Removed images directory: {images_dir}")
        
        if os.path.exists(audio_dir):
            shutil.rmtree(audio_dir)
            print(f"  ✓ Removed audio directory: {audio_dir}")
            
    except Exception as e:
        print(f"  ✗ Error during cleanup: {e}")