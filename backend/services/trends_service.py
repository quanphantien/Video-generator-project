import json
import re
from typing import List
from dto.trend_dto import TrendResponse
from services.gemini import generate_trends


def get_trends(keyword , count ) -> list:

    ai_response = generate_trends(keyword  ,count)
    trend_data = extract_json_list(ai_response)
    trends = [TrendResponse(**trend) for trend in trend_data]
    return trends

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
