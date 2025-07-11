from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import tempfile
import os
from pathlib import Path
import shutil
import ffmpeg
from services.cloudary import upload_audio_to_cloudinary
import uuid

router = APIRouter(tags=["Audio"])

@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload file audio (WAV/MP3) và chuyển đổi sang MP3 nếu cần, sau đó upload lên Cloudinary
    """
    try:
        # Kiểm tra định dạng file
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File phải là định dạng audio")
        
        # Tạo thư mục tạm
        temp_dir = Path("temp/audio")
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Tạo tên file unique
        file_id = str(uuid.uuid4())
        original_filename = file.filename or "audio"
        file_extension = Path(original_filename).suffix.lower()
        
        # Lưu file tạm thời
        temp_input_path = temp_dir / f"{file_id}_input{file_extension}"
        temp_output_path = temp_dir / f"{file_id}_output.mp3"
        
        # Lưu file upload
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Chuyển đổi sang MP3 nếu cần
        if file_extension not in ['.mp3', '.mpeg'] and not file.content_type.startswith('audio/mpeg'):
            # Sử dụng ffmpeg để chuyển đổi
            try:
                # Kiểm tra xem ffmpeg có available không
                import subprocess
                result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
                if result.returncode != 0:
                    raise HTTPException(status_code=500, detail="FFmpeg không được cài đặt trên hệ thống")
                
                (
                    ffmpeg
                    .input(str(temp_input_path))
                    .output(str(temp_output_path), acodec='mp3', audio_bitrate='128k')
                    .overwrite_output()
                    .run(quiet=True)
                )
                final_file_path = temp_output_path
            except subprocess.CalledProcessError:
                raise HTTPException(status_code=500, detail="FFmpeg không được cài đặt trên hệ thống")
            except FileNotFoundError:
                raise HTTPException(status_code=500, detail="FFmpeg không tìm thấy trong PATH")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Lỗi chuyển đổi audio: {str(e)}")
        else:
            # File đã là MP3, upload trực tiếp
            final_file_path = temp_input_path
            print(f"✅ File đã là MP3 format: {file.content_type}, upload trực tiếp")
        
        # Upload lên Cloudinary
        cloudinary_url = upload_audio_to_cloudinary(final_file_path)
        
        if not cloudinary_url:
            raise HTTPException(status_code=500, detail="Không thể upload lên cloud")
        
        # Cleanup các file tạm
        try:
            if temp_input_path.exists():
                temp_input_path.unlink()
            if temp_output_path.exists():
                temp_output_path.unlink()
        except Exception as e:
            print(f"Warning: Không thể xóa file tạm: {e}")
        
        return JSONResponse(content={
            "success": True,
            "message": "Upload audio thành công",
            "data": {
                "url": cloudinary_url,
                "original_filename": original_filename,
                "format": "mp3"
            }
        })
        
    except Exception as e:
        print(f"Error uploading audio: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi upload audio: {str(e)}")
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import uuid
import ffmpeg
import shutil

# Xóa function dummy này vì đã import từ services
# def upload_audio_to_cloudinary(mp3_path: Path) -> str:
#     # Dummy URL, bạn nên dùng Cloudinary thật ở đây
#     return f"https://your-cloud.com/{mp3_path.name}"

router = APIRouter()

@router.post("/process-audio")
async def process_audio_complete(file: UploadFile = File(...)):
    try:
        print(f"📥 Received: {file.filename} ({file.content_type})")
        
        if not file.content_type.startswith(('audio/', 'video/')):
            raise HTTPException(status_code=400, detail="File phải là định dạng audio hoặc video")
        
        # Chuẩn bị thư mục và đường dẫn
        temp_dir = Path("temp/audio")
        temp_dir.mkdir(parents=True, exist_ok=True)
        file_id = str(uuid.uuid4())

        # Lấy đuôi file hoặc đoán theo content-type
        original_filename = file.filename or "audio"
        input_ext = Path(original_filename).suffix.lower()
        if not input_ext:
            ct = file.content_type.lower()
            if 'webm' in ct: input_ext = '.webm'
            elif 'ogg' in ct: input_ext = '.ogg'
            elif 'wav' in ct: input_ext = '.wav'
            else: input_ext = '.webm'

        input_path = temp_dir / f"{file_id}_input{input_ext}"
        mp3_path = temp_dir / f"{file_id}.mp3"

        # Ghi file upload
        content = await file.read()
        input_path.write_bytes(content)
        original_size = len(content)

        # Convert sang MP3
        try:
            print(f"🔄 Converting {input_ext} → .mp3...")
            (
                ffmpeg
                .input(str(input_path))
                .output(
                    str(mp3_path),
                    acodec='libmp3lame',
                    audio_bitrate='192k',
                    ar=44100,
                    ac=2,
                    q='2'
                )
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi chuyển đổi audio: {str(e)}")

        # Kiểm tra file kết quả
        if not mp3_path.exists() or mp3_path.stat().st_size == 0:
            raise HTTPException(status_code=500, detail="File MP3 bị lỗi hoặc trống")

        compressed_size = mp3_path.stat().st_size
        compression_ratio = ((original_size - compressed_size) / original_size * 100) if original_size > 0 else 0

        # Upload
        print("☁️ Uploading MP3 to cloud...")
        cloud_url = upload_audio_to_cloudinary(mp3_path)

        # Cleanup
        try:
            input_path.unlink(missing_ok=True)
            mp3_path.unlink(missing_ok=True)
        except Exception as e:
            print(f"⚠️ Cleanup failed: {e}")

        # Response
        return JSONResponse(content={
            "success": True,
            "message": "Đã xử lý và upload thành công",
            "data": {
                "url": cloud_url,
                "format": "mp3",
                "bitrate": "192k",
                "sample_rate": "44100Hz",
                "channels": "stereo",
                "original_filename": original_filename
            },
            "originalSize": original_size,
            "compressedSize": compressed_size,
            "compressionRatio": f"{compression_ratio:.1f}%",
            "note": f"Chuyển từ {input_ext.upper()} sang MP3 chất lượng cao"
        })

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")

@router.post("/webm-to-mp3")
async def convert_webm_to_mp3(file: UploadFile = File(...)):
    """
    Chuyển đổi WebM sang MP3 chất lượng cao và upload lên cloud
    """
    try:
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File phải là định dạng audio")
        
        print(f"📥 Received audio file: {file.filename}, content-type: {file.content_type}")
        
        # Tạo thư mục tạm
        temp_dir = Path("temp/audio")
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        file_id = str(uuid.uuid4())
        
        # Xác định extension từ content type hoặc filename
        if 'webm' in (file.content_type or '').lower() or 'webm' in (file.filename or '').lower():
            input_ext = '.webm'
        elif 'ogg' in (file.content_type or '').lower() or 'ogg' in (file.filename or '').lower():
            input_ext = '.ogg'
        else:
            input_ext = '.webm'  # Default fallback
            
        temp_input_path = temp_dir / f"{file_id}_input{input_ext}"
        temp_mp3_path = temp_dir / f"{file_id}_output.mp3"
        
        # Lưu file input
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"💾 Saved input file: {temp_input_path}, size: {temp_input_path.stat().st_size} bytes")
        
        # Chuyển đổi sang MP3 chất lượng cao
        try:
            print(f"🔄 Converting {input_ext} to MP3...")
            (
                ffmpeg
                .input(str(temp_input_path))
                .output(
                    str(temp_mp3_path), 
                    acodec='libmp3lame',  # Sử dụng LAME encoder cho chất lượng tốt
                    audio_bitrate='192k',  # Bitrate cao hơn cho chất lượng tốt
                    ar=44100,  # Sample rate chuẩn
                    ac=2  # Stereo
                )
                .overwrite_output()
                .run(quiet=True)
            )
            
            if not temp_mp3_path.exists():
                raise Exception("File MP3 không được tạo")
                
            print(f"✅ Conversion successful: {temp_mp3_path}, size: {temp_mp3_path.stat().st_size} bytes")
            
        except Exception as e:
            print(f"❌ FFmpeg conversion error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Lỗi chuyển đổi audio: {str(e)}")
        
        # Upload MP3 lên Cloudinary
        print("☁️ Uploading to Cloudinary...")
        cloudinary_url = upload_audio_to_cloudinary(temp_mp3_path)
        
        if not cloudinary_url:
            raise HTTPException(status_code=500, detail="Không thể upload lên cloud")
        
        # Tính toán thông tin compression
        original_size = temp_input_path.stat().st_size
        compressed_size = temp_mp3_path.stat().st_size
        compression_ratio = ((original_size - compressed_size) / original_size * 100) if original_size > 0 else 0
        
        # Cleanup files
        try:
            temp_input_path.unlink()
            temp_mp3_path.unlink()
        except Exception as e:
            print(f"Warning: Không thể xóa file tạm: {e}")
        
        return JSONResponse(content={
            "success": True,
            "message": "Chuyển đổi WebM sang MP3 thành công",
            "data": {
                "url": cloudinary_url,
                "original_filename": file.filename,
                "format": "mp3",
                "bitrate": "192k",
                "sample_rate": "44100Hz",
                "channels": "stereo"
            },
            "originalSize": original_size,
            "compressedSize": compressed_size,
            "compressionRatio": f"{compression_ratio:.1f}",
            "note": f"Converted from {input_ext.upper()} to high-quality MP3"
        })
        
    except Exception as e:
        print(f"Error converting WebM to MP3: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi chuyển đổi WebM sang MP3: {str(e)}")

@router.post("/convert-and-upload")
async def convert_and_upload_audio(file: UploadFile = File(...)):
    """
    Chuyển đổi WAV sang MP3 và upload lên cloud
    """
    try:
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File phải là định dạng audio")
        
        # Tạo thư mục tạm
        temp_dir = Path("temp/audio")
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        file_id = str(uuid.uuid4())
        temp_wav_path = temp_dir / f"{file_id}.wav"
        temp_mp3_path = temp_dir / f"{file_id}.mp3"
        
        # Lưu file WAV
        with open(temp_wav_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Chuyển đổi WAV sang MP3
        try:
            # Kiểm tra FFmpeg availability
            import subprocess
            result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
            if result.returncode != 0:
                raise HTTPException(status_code=500, detail="FFmpeg không được cài đặt trên hệ thống")
            
            (
                ffmpeg
                .input(str(temp_wav_path))
                .output(str(temp_mp3_path), acodec='mp3', audio_bitrate='128k')
                .overwrite_output()
                .run(quiet=True)
            )
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="FFmpeg không được cài đặt trên hệ thống")
        except FileNotFoundError:
            raise HTTPException(status_code=500, detail="FFmpeg không tìm thấy trong PATH")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi chuyển đổi WAV sang MP3: {str(e)}")
        
        # Upload MP3 lên Cloudinary
        cloudinary_url = upload_audio_to_cloudinary(temp_mp3_path)
        
        if not cloudinary_url:
            raise HTTPException(status_code=500, detail="Không thể upload lên cloud")
        
        # Cleanup
        try:
            temp_wav_path.unlink()
            temp_mp3_path.unlink()
        except Exception as e:
            print(f"Warning: Không thể xóa file tạm: {e}")
        
        return JSONResponse(content={
            "success": True,
            "message": "Chuyển đổi và upload thành công",
            "data": {
                "url": cloudinary_url,
                "format": "mp3",
                "bitrate": "128k"
            }
        })
        
    except Exception as e:
        print(f"Error converting audio: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi chuyển đổi audio: {str(e)}")
