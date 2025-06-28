import os
import uuid
from fastapi import Path
from gtts import gTTS
from google.genai import types

import cloudinary.uploader
from config import settings
from dto.image_dto import ImageResponse
from services.gemini import generate_image_by_gemini

def generate_tts(text: str, voice: str) -> str:
    file_name = f"tts_{uuid.uuid4()}.mp3"
    output_path = os.path.join("temp", file_name)
    os.makedirs("temp", exist_ok=True)
    tts = gTTS(text=text, lang=voice if voice else 'vi', slow=False)
    tts.save(output_path)
    print(f"name: {settings.CLOUDINARY_CLOUD_NAME}, key: {settings.CLOUDINARY_API_KEY}, secret: {settings.CLOUDINARY_API_SECRET}")
    upload = cloudinary.uploader.upload(
        output_path,
        resource_type="video",
        public_id=f"tts/{file_name}",
        cloud_name="deb1zkv9x",
        api_key="665826282433797",
        api_secret="Eawws29ORDWnS_c5e4HX0y_ckh4"
    )
    os.remove(output_path)
    return upload["secure_url"]


def generate_image(prompt : str) -> str:
    return ImageResponse(image_url=generate_image_by_gemini(prompt))



    