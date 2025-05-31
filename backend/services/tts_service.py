import os
import uuid
from gtts import gTTS
import cloudinary.uploader
from config import settings

def generate_tts(text: str, voice: str) -> str:
    file_name = f"tts_{uuid.uuid4()}.mp3"
    output_path = os.path.join("temp", file_name)
    
    os.makedirs("temp", exist_ok=True)
    
    tts = gTTS(text=text, lang=voice if voice else 'vi', slow=False)
    tts.save(output_path)
    
    print(f"name: {settings.CLOUDINARY_CLOUD_NAME}, key: {settings.CLOUDINARY_API_KEY}, secret: {settings.CLOUDINARY_API_SECRET}")


    # Upload file lên Cloudinary (theo yêu cầu SRS)
    upload = cloudinary.uploader.upload(
        output_path,
        resource_type="video",
        public_id=f"tts/{file_name}",
        cloud_name="deb1zkv9x",
        api_key="665826282433797",
        api_secret="Eawws29ORDWnS_c5e4HX0y_ckh4"
    )
    
    # Xóa file tạm sau khi upload
    os.remove(output_path)
    
    # Trả về URL của file âm thanh
    return upload["secure_url"]
