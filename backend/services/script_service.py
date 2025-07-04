import json
from google import genai
import re

from config.config import Settings
from dto.scene import Scene

from dto.script_dto import ScriptRequest, ScriptResponse
from services.ai_service import generate_script
from services.style_service import getStyleByUserId

from requests import Session

def generate(request : ScriptRequest , user_id : str  , db: Session ):
    style: dict = getStyleByUserId(db , user_id)
    str_data  = generate_script(request.language , request.prompt , request.num_scenes, style)
    scenes_data = extract_json_list(str_data)
    scenes = [Scene(**scene) for scene in scenes_data]
    return ScriptResponse(
        language=request.language,
        prompt=request.prompt,
        num_scenes=request.num_scenes,
        scenes=scenes
    )
   
def extract_json_list(text: str):
    try:
        start = text.find('[')
        if start == -1:
            return []
        
        bracket_count = 0
        end = start
        for i, char in enumerate(text[start:], start):
            if char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
                if bracket_count == 0:
                    end = i + 1
                    break
        
        json_part = text[start:end]
        return json.loads(json_part)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Lỗi decode JSON: {e}")
        return parse_fallback(text)
    return []

def parse_fallback(text: str):
    scenes = []
    return scenes