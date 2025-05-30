from google import genai
from fastapi import FastAPI
from config import settings

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

