import os
from pathlib import Path
import uuid
from gtts import gTTS
from google.genai import types

import cloudinary.uploader
import requests
import urllib
from config import settings
from dto.image_dto import ImageResponse
from services.gemini import generate_image_by_gemini
import os
import tempfile
import requests
from pathlib import Path
from typing import List
from pydantic import BaseModel
import cloudinary
import cloudinary.uploader

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


def download_resources(url: str, temp_dir: Path) : 
    """Download file from URL to temporary directory"""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    # Get filename from URL or create one
    parsed_url = urllib.parse.urlparse(url)
    filename = os.path.basename(parsed_url.path)
    if not filename or '.' not in filename:
        # Determine extension from content-type
        content_type = response.headers.get('content-type', '')
        if 'audio' in content_type:
            filename = f"audio_{hash(url)}.mp3"
        elif 'image' in content_type:
            filename = f"image_{hash(url)}.jpg"
        else:
            filename = f"file_{hash(url)}"
    
    file_path = temp_dir / filename
    with open(file_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return file_path
    

    