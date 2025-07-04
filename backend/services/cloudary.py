
from pathlib import Path
import cloudinary
from config.config import settings

cloudinary.config(
    cloud_name="deb1zkv9x" , 
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

def upload_image_to_cloudinary(file_path: Path) -> str:
    """
    Upload một file ảnh lên Cloudinary và trả về URL.
    """
    folder = "image_generated"
    try:
        upload_result = cloudinary.uploader.upload(
            str(file_path),
            resource_type="image",
            public_id=f"{folder}/{file_path.stem}",
            folder=folder,
            transformation=[
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ],
            tags=["ai_generated"]
        )
        print("[✓] Upload thành công.")
        return upload_result["secure_url"]

    except Exception as e:
        print(f"[!] Upload thất bại: {e}")
        return ""
    

def upload_video_to_cloudinary(file_path: Path) -> str:
    """
    Upload một file ảnh lên Cloudinary và trả về URL.
    """
    folder = "video_generated"
    try:
        upload_result = cloudinary.uploader.upload(
            str(file_path),
            resource_type="video",
            public_id=f"{folder}/{file_path.stem}",
            folder=folder,
            transformation=[
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ],
            tags=["ai_generated"]
        )
        print("[✓] Upload thành công.")
        return upload_result["secure_url"]

    except Exception as e:
        print(f"[!] Upload thất bại: {e}")
        return ""
    
from pathlib import Path
import cloudinary.uploader

def upload_audio_to_cloudinary(file_path: Path) -> str:
    if not file_path.exists():
        raise FileNotFoundError(f"{file_path} does not exist.")

    try:
        upload_result = cloudinary.uploader.upload(
            str(file_path),
            resource_type="video", 
            public_id=f"tts/{file_path.stem}",
            transformation=[
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ],
            tags=["ai_generated"]
        )
        print("[✓] Upload thành công.")
        return upload_result["secure_url"]

    except Exception as e:
        print(f"[!] Upload thất bại: {e}")
        raise Exception("Cloudinary upload failed") from e
