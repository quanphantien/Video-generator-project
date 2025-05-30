from google import genai
from fastapi import FastAPI
app = FastAPI()

client = genai.Client(api_key="AIzaSyCom7hSxqs0qVMRqSA9z8sM6_zm0Ic3Ino")
def generate_content():
    """
    Generate content using the Gemini model.
    
    Returns:
        str: The generated content.
    """
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Các chủ đề đang theo xu hướng",
    )
    return response.text

