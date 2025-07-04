from io import BytesIO
import json
from pathlib import Path
from PIL import Image
import uuid
from google import genai
from fastapi import FastAPI
import requests
from config.config import settings
from google.genai import types
from services.cloudary import upload_image_to_cloudinary
from huggingface_hub import InferenceClient
import replicate

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

def generate_script(language , prompt ,num_scenes , style  ) : 


    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=get_prompt(style=style , prompt=prompt , num_scenes= num_scenes , language=language),
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
    
    if keyword is not None:
        if keyword.strip():
            base_prompt += f" related to '{keyword.strip()}'"
        else:
            base_prompt += " across all categories (technology, social media, entertainment, business, lifestyle)"
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

def generate_image_by_hugging_face(prompt: str) -> str:
    temp_file_path = None
    try:
        file_name = f"generated_image_{uuid.uuid4()}.png"
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        temp_file_path = temp_dir / file_name
        client = InferenceClient(api_key=settings.HUGGING_FACE)
        image: Image.Image = client.text_to_image(prompt)
        image.save(temp_file_path, format='PNG', optimize=True, quality=85)
        image_url = upload_image_to_cloudinary(temp_file_path)
        return image_url
    except Exception as e:
        print(f"Error in generate_image_by_hugging_face: {str(e)}")
        raise Exception(f"Failed to generate or upload image: {str(e)}")
    finally:
        if temp_file_path and temp_file_path.exists():
            try:
                temp_file_path.unlink()
                print(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as cleanup_error:
                print(f"Warning: Failed to cleanup temp file: {cleanup_error}")

def generate_image_by_replicate(prompt: str) -> str:
    temp_file_path = None
    try:
        file_name = f"generated_image_{uuid.uuid4()}.png"
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        temp_file_path = temp_dir / file_name
        replicate_client = replicate.Client(api_token=settings.REPLICATE_API_KEY)
        output = replicate_client.run(
            "black-forest-labs/flux-1.1-pro",
            input={
                "prompt": prompt
            }
        )
        with open(temp_file_path, "wb") as f:
            f.write(output.read())
        uploaded_url = upload_image_to_cloudinary(temp_file_path)
        return uploaded_url

    except Exception as e:
        print(f"❌ Lỗi khi tạo ảnh: {str(e)}")
        raise Exception(f"Failed to generate or upload image: {str(e)}")

    finally:
        if temp_file_path and temp_file_path.exists():
            try:
                temp_file_path.unlink()
                print(f"🧹 Đã xóa file tạm: {temp_file_path}")
            except Exception as cleanup_error:
                print(f"⚠️ Không thể xóa file tạm: {cleanup_error}")

def get_prompt(prompt: str, num_scenes: int, language: str,
               style: dict,
               color_scheme: str = "warm_earthy_tones",
               detail_level: str = "high") -> str:
    if not style:
        style = {
            "style": "classics",
            "tone": "melancholic",
            "sentence_length": "around 20 word ",
            "vocabulary": "formal"
        }

    default_base_context = "a culturally rich environment inspired by the story idea, with consistent visual tone"
    full_prompt = f"""
You are an expert in storytelling and screenplay writing. Create a short screenplay in {language}, consisting of {num_scenes} scenes, based on the idea: '{prompt}'.

Infer and define a `base_context` that reflects the overall setting, time period, and cultural atmosphere of the story based on the prompt. 
Start from the default base_context: '{default_base_context}', and customize it to fit the idea naturally 
(e.g., 'rural Vietnam in the 1990s', or 'a futuristic city with advanced technology').

Use the inferred base_context and the following image generation parameters for consistency in style and mood:

- style: {style.get('style', 'classics')}
- tone (as mood): {style.get('tone', "melancholic")}
- sentence_length: {style.get('sentence_length', 'short')}
- vocabulary: {style.get('vocabulary', 'formal')}
- color_scheme: {color_scheme}
- setting: based on prompt 
- detail_level: {detail_level}

For each scene, return a dictionary with:
1. `"text"`: A short cinematic description in {language} (1–2 sentences,  around {style.get('sentence_length', '25')} words), consistent with the `base_context`.
2. `"prompt"`: A detailed English prompt for generating a realistic image. Embed:
    - The scene's imagery and cultural elements
    - The full base_context
    - The values from image generation parameters above (style, mood, etc.)
    - Use natural language and cinematic vividness
3. `"tts"`: Extracted from the first sentence of `"text"`, suitable for natural narration.
4. `"base_context"`: The same consistent string inferred earlier, repeated for each scene.

Return the scenes as a JSON-like list of dictionaries, like:
[
    {{
        "text": "Một người đàn ông đứng lặng trong cánh đồng lúa lúc hoàng hôn.",
        "prompt": "A Vietnamese man standing still in a rice field at sunset, warm earthy tones, melancholic tone, rural Vietnam in the 1990s, high detail, classic style.",
        "tts": "Một người đàn ông đứng lặng trong cánh đồng lúa",
        "base_context": "rural Vietnam in the 1990s"
    }}
]
"""
    return full_prompt

