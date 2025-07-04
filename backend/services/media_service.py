import os
from pathlib import Path
import uuid
from gtts import gTTS
from google.genai import types

import cloudinary.uploader
import requests
import urllib
from config.config import settings
from config.constants import voices , models
from dto.image_dto import ImageResponse, Model
from dto.tts_dto import Voice
from services.ai_service import generate_image_by_gemini, generate_image_by_hugging_face, generate_image_by_replicate
import os
import tempfile
import requests
from pathlib import Path
import azure.cognitiveservices.speech as speechsdk
import cloudinary
from services.cloudary import upload_audio_to_cloudinary

def generate_tts(text: str, voice: str = "vi-VN-NamMinhNeural") -> str:
    output_path = None
    try:
        temp_dir = "temp"
        os.makedirs(temp_dir, exist_ok=True)
        file_name = f"tts_{uuid.uuid4()}.wav"
        output_path = os.path.join(temp_dir, file_name)
        print(voice)
        if (voice == voices['VN_GOOGLE_VOICE']) :
            lang_code = 'vi'  
            if voice == voices['VN_GOOGLE_VOICE']:
                lang_code = 'vi'
            elif voice == voices['EN_GOOGLE_VOICE']:  
                lang_code = 'en'

            tts = gTTS(text=text, lang= lang_code, slow=False , )
            tts.save(output_path)
            uploadUrl = upload_audio_to_cloudinary(file_path=Path(output_path))

        else : 
            speech_config = speechsdk.SpeechConfig(
                subscription=settings.SPEECH_KEY,
                region="southeastasia"
            )
            speech_config.speech_synthesis_voice_name = voice
            synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
            result = synthesizer.speak_text_async(text).get()
            if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
                raise Exception(f"TTS failed: {result.reason}")
            with open(output_path, "wb") as f:
                f.write(result.audio_data)
            uploadUrl = upload_audio_to_cloudinary(file_path=Path(output_path))
        os.remove(output_path)
        return uploadUrl

    except Exception as e:
        print(f"❌ Lỗi khi tạo hoặc upload TTS: {e}")
        raise Exception(f"Failed to synthesize or upload TTS: {str(e)}")

    finally:
        if output_path and os.path.exists(output_path):
            try:
                os.remove(output_path)
                print(f"🧹 Đã xóa file tạm: {output_path}")
            except Exception as cleanup_error:
                print(f"⚠️ Lỗi khi xóa file tạm: {cleanup_error}")

def generate_image(prompt : str , modelCode : str ) -> str:
    if (modelCode == "GE") : 
        return ImageResponse(image_url=generate_image_by_gemini(prompt))
    elif (modelCode == "RE") : 
        return ImageResponse(image_url=generate_image_by_replicate(prompt))
    else : 
        return ImageResponse(image_url=generate_image_by_hugging_face(prompt))


def download_resources(url: str, temp_dir: Path) : 
    """Download file from URL to temporary directory"""
    response = requests.get(url, stream=True)
    response.raise_for_status()
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
    


def getVoices():
    return [
        Voice(gender="male", language="en", name=voices['EN_VOICE_MALE']),
        Voice(gender="female", language="en", name=voices['EN_VOICE_FEMALE']),
        Voice(gender="male", language="vi", name=voices['VN_GOOGLE_VOICE']),
        Voice(gender="male", language="en", name=voices['EN_GOOGLE_VOICE']),
        Voice(gender="female", language="vi", name=voices['VN_VOICE_FEMALE']),
        Voice(gender="male", language="vi", name=voices['VN_VOICE_MALE']),
    ]

def getModels():
    return models
    