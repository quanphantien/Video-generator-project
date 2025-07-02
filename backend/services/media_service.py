import os
from pathlib import Path
import uuid
from gtts import gTTS
from google.genai import types

import cloudinary.uploader
import requests
import urllib
from config.config import settings
from config.constants import EN_VOICE_FEMALE, EN_VOICE_MALE, GOOGLE_VOICE_FEMALE, GOOGLE_VOICE_MALE, VN_VOICE_FEMALE, VN_VOICE_MALE
from dto.image_dto import ImageResponse
from dto.tts_dto import Voice
from services.ai_service import generate_image_by_gemini
import os
import tempfile
import requests
from pathlib import Path
import azure.cognitiveservices.speech as speechsdk
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

def generate_tts_2(text: str, voice: str = "vi-VN-NamMinhNeural") -> str:
    output_path = None
    try:
        temp_dir = "temp"
        os.makedirs(temp_dir, exist_ok=True)
        file_name = f"tts_{uuid.uuid4()}.wav"
        output_path = os.path.join(temp_dir, file_name)
        speech_key = settings.SPEECH_KEY
        service_region = "southeastasia"  
        speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
        speech_config.speech_synthesis_voice_name = "vi-VN-NamMinhNeural"  
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
        result = synthesizer.speak_text_async(text).get()
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            audio_data = result.audio_data
            with open("output.wav", "wb") as f:
                f.write(audio_data)
        upload = cloudinary.uploader.upload(
            "output.wav",
            resource_type="video",
            public_id=f"tts/{file_name}",
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )

        return upload["secure_url"]

    except Exception as e:
        print(f"❌ Lỗi khi tạo hoặc upload TTS: {e}")
        raise Exception(f"Failed to synthesize or upload: {str(e)}")

    finally:
        if output_path and os.path.exists(output_path):
            try:
                os.remove(output_path)
                print(f"🧹 Đã xóa file tạm: {output_path}")
            except Exception as cleanup_error:
                print(f"⚠️ Lỗi khi xóa file tạm: {cleanup_error}")

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
    


def getVoices() :
    return [
        Voice(gender="male" , language="en"  ,name=EN_VOICE_MALE),
        Voice(gender="female" , language="en"  ,name=EN_VOICE_FEMALE),
        Voice(gender="male" , language="en/vn"  ,name=GOOGLE_VOICE_MALE),
        Voice(gender="female" , language="en/vn"  ,name=GOOGLE_VOICE_FEMALE),
        Voice(gender="female" , language="vn"  ,name=VN_VOICE_FEMALE),
        Voice(gender="male" , language="vn"  ,name=VN_VOICE_MALE),
    ]


    