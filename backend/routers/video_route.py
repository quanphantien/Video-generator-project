from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
import httpx
import asyncio
from app_code import appCode
from dependencies.auth_config import get_user_id_from_token
from database.session import SessionLocal
from dependencies.db import get_db
from dto.standard_response import StandardResponse
from dto.video_dto import VideoEditRequest, VideoEditResponse, VideoRequest, VideoResponse
from services.video_service import generate_video, edit_video, get_user_videos , delete_video
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/generate", response_model=StandardResponse[VideoResponse])
async def generate_video_endpoint(request: VideoRequest , user_id: str = Depends(get_user_id_from_token) , db: Session = Depends(get_db)):
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Generate video succesfully  " ,
                data = generate_video(request=request ,  user_id= user_id , db= db))
@router.post("/edit", response_model=StandardResponse[VideoEditResponse])
async def edit_video_endpoint(video_id: str,  request : VideoEditRequest , db: Session = Depends(get_db)):
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Edit video succesfully  " ,
                data = VideoEditResponse(success=True, new_video=edit_video(video_id , request  ,db)))
    
@router.get("", response_model=StandardResponse[list[VideoResponse]])
async def get_videos(db: Session = Depends(get_db)  ,user_id = Depends(get_user_id_from_token)   ):
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get video succesfully  " ,
                data = get_user_videos(db= db, user_id=user_id))
    
@router.delete("/{video_id}", response_model=StandardResponse[bool])
async def delete_video_endpoint(video_id: str, db: Session = Depends(get_db) , user_id = Depends(get_user_id_from_token)):
    success = delete_video(video_id=video_id,db= db , user_id= user_id)
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Delete succesfully  " ,
                data = True)

@router.post("/youtube/upload")
async def upload_to_youtube(
    video_url: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    access_token: str = Form(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Endpoint để upload video lên YouTube thông qua proxy
    """
    try:
        if not access_token:
            raise HTTPException(status_code=400, detail="Access token is required")
        
        if not video_url:
            raise HTTPException(status_code=400, detail="Video URL is required")
        
        print(f"🚀 Starting YouTube upload for user {user_id}")
        print(f"📹 Video URL: {video_url}")
        print(f"📝 Title: {title}")
        
        # Tải video từ URL
        async with httpx.AsyncClient(timeout=300.0) as client:
            print(f"📥 Downloading video from: {video_url}")
            video_response = await client.get(video_url)
            if video_response.status_code != 200:
                print(f"❌ Failed to download video: {video_response.status_code}")
                raise HTTPException(status_code=400, detail=f"Cannot download video: {video_response.status_code}")
            
            video_content = video_response.content
            content_type = video_response.headers.get('content-type', 'video/mp4')
            print(f"✅ Video downloaded successfully, size: {len(video_content)} bytes, type: {content_type}")
        
        # Metadata cho YouTube
        metadata = {
            "snippet": {
                "title": title or "Untitled Video",
                "description": description or "Video được tạo bởi AI Video Generator",
                "tags": ["AI Video", "Video Generator", "Automation"],
                "categoryId": "22"
            },
            "status": {
                "privacyStatus": "private",
                "embeddable": True,
                "license": "youtube"
            }
        }
        
        print(f"📤 Initiating YouTube upload...")
        
        # Khởi tạo resumable upload
        async with httpx.AsyncClient(timeout=300.0) as client:
            init_response = await client.post(
                "https://www.googleapis.com/youtube/v3/videos",
                params={
                    "uploadType": "resumable",
                    "part": "snippet,status"
                },
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                    "X-Upload-Content-Type": content_type,
                    "X-Upload-Content-Length": str(len(video_content))
                },
                json=metadata
            )
            
            print(f"📋 Init response status: {init_response.status_code}")
            
            if init_response.status_code != 200:
                error_detail = init_response.text
                print(f"❌ Init upload failed: {error_detail}")
                raise HTTPException(status_code=init_response.status_code, detail=f"Init upload failed: {error_detail}")
            
            upload_url = init_response.headers.get("Location")
            if not upload_url:
                print(f"❌ No upload URL received")
                raise HTTPException(status_code=500, detail="No upload URL received")
            
            print(f"✅ Upload URL received: {upload_url[:50]}...")
        
        # Upload video content
        print(f"⬆️ Uploading video content...")
        async with httpx.AsyncClient(timeout=600.0) as client:
            upload_response = await client.put(
                upload_url,
                content=video_content,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": content_type
                }
            )
            
            print(f"📤 Upload response status: {upload_response.status_code}")
            
            if upload_response.status_code not in [200, 201]:
                error_detail = upload_response.text
                print(f"❌ Upload failed: {error_detail}")
                raise HTTPException(status_code=upload_response.status_code, detail=f"Upload failed: {error_detail}")
            
            result = upload_response.json()
            video_id = result.get("id")
            
            print(f"🎉 Upload successful! Video ID: {video_id}")
            
            return StandardResponse(
                code=appCode.SUCCESS,
                message="Video uploaded to YouTube successfully",
                data={
                    "video_id": video_id,
                    "video_url": f"https://www.youtube.com/watch?v={video_id}",
                    "status": "private"
                }
            )
            
    except httpx.TimeoutException:
        print(f"⏰ Upload timeout")
        raise HTTPException(status_code=408, detail="Upload timeout - video file too large or slow connection")
    except httpx.RequestError as e:
        print(f"🌐 Network error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        print(f"💥 Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")