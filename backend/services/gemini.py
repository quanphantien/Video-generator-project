from io import BytesIO
import json
from pathlib import Path
from PIL import Image
import uuid
from google import genai
from fastapi import FastAPI
from config import settings
from google.genai import types
from services.cloudary import upload_image_to_cloudinary

app = FastAPI()

client = genai.Client(api_key=settings.GEMINI_API_KEY)
def generate_content(string: str) -> str:
    """
    Generate content using the Gemini model.
    
    Returns:
        str: The generated content.
    """
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=string,
    )
    return response.text

def generate_script(language , prompt ,num_scenes ) : 
    full_prompt = f"""
    You are an expert in storytelling inspired by literary works. Create a short screenplay with {num_scenes} scenes based on the following idea: '{prompt}'. 
    The screenplay should be in {language}, capturing a melancholic and realistic atmosphere similar to Nam Cao's 'Lão Hạc'. Each scene should include:
    - A short description (in {language}) for the scene (1-2 sentences, max 20 words).
    - A detailed English prompt for generating a realistic image, including cultural elements of {language}, muted earthy tones, and a tragic mood.
    - A TTS field using the first part of the description (up to the first comma or period).
    Required JSON format:
    [
        {{
            "text": "Scene description in {language}",
            "prompt": "Detailed English image prompt",
            "tts": "Short TTS text"
        }}
    ]
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt,
        )

        result = response.text
        return result

    except Exception as e:
        print(f"Lỗi khi tạo kịch bản: {e}")
        return []

def generate_trend_prompt(keyword: str = "", count: int = 5) -> str:
    """
    Tạo prompt để AI generate trends theo format yêu cầu
    """
    base_prompt = f"""
        You are a trend analysis expert. Generate the top {count} trending topics/keywords"""
    
    if keyword.strip():
        base_prompt += f" related to '{keyword}'"
    else:
        base_prompt += " across all categories (technology, social media, entertainment, business, lifestyle)"
    
    full_prompt = f"""{base_prompt}.

    For each trend, provide:
    - keyword: The trending topic/hashtag/phrase
    - popularity: A score from 1-100 representing current popularity level

    Return ONLY a valid JSON array in this exact format, no other text:
    [
        {{
            "keyword": "AI-generated content", 
            "popularity": 95
        }}
    ]

    Rules:
    - Each keyword should be concise (2-5 words max)
    - Popularity scores should reflect current real-world trends
    - Focus on trends from the last 3-6 months
    - Return exactly {count} trends
    - Use only valid JSON format
    """
    return full_prompt

def generate_trends(keyword , count ):
    """
    Main function để generate trends từ AI và parse response
    """
    prompt = generate_trend_prompt(keyword,count)
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        result = response.text
        print(type(result))
        return result

    except Exception as e:
        print(f"Lỗi khi tạo kịch bản: {e}")
        return []

def generate_image_by_gemini(prompt) : 
    temp_file_path = None 
    try: 
        file_name = f"generated_image_{uuid.uuid4()}.png"
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        temp_file_path = temp_dir / file_name
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=prompt,
            config=types.GenerateContentConfig(
            response_modalities=['TEXT', 'IMAGE']
            )
        )

        for part in response.candidates[0].content.parts:
            if part.text is not None:
                print("part TEXT " , part.text)
            elif part.inline_data is not None:
                image = Image.open(BytesIO((part.inline_data.data)))
                image.save('gemini-native-image.png')
        image.save(temp_file_path, format='PNG', optimize=True, quality=85)
        image_url = upload_image_to_cloudinary(temp_file_path)
        return image_url
        
    except Exception as e:
        print(f"Error in generate_image: {str(e)}")
        raise Exception(f"Failed to generate or upload image: {str(e)}")
        
    finally:
        if temp_file_path and temp_file_path.exists():
            try:
                temp_file_path.unlink()
                print(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as cleanup_error:
                print(f"Warning: Failed to cleanup temp file: {cleanup_error}")