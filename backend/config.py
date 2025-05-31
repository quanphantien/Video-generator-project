import os
from dotenv import load_dotenv

# Load các biến môi trường từ file .env
load_dotenv()

class Settings:
    def __init__(self):
        self.YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
        self.GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        self.CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
        self.CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
        self.CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")
        required_keys = [
            'YOUTUBE_API_KEY','GEMINI_API_KEY','CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'
        ]
        for key in required_keys:
            if not getattr(self, key):
                raise ValueError(f"Missing required environment variable: {key}")
            
settings = Settings()