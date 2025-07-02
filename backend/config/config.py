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
        self.DATABASE_URL = os.getenv("DATABASE_URL", "")
        self.REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", ""))
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        self.ALGORITHM = os.getenv("ALGORITHM", "")
        self.SECRET_KEY = os.getenv("SECRET_KEY", "")
        self.YOUTUBE_DATA_KEY = os.getenv("YOUTUBE_DATA_KEY", "")
        self.HUGGING_FACE = os.getenv("HUGGING_FACE", "")
        self.REPLICATE_API_KEY = os.getenv("REPLICATE_API_KEY", "")
        self.SPEECH_KEY = str(os.getenv("SPEECH_KEY", ""))


        required_keys = [
            'YOUTUBE_API_KEY','GEMINI_API_KEY','CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'
        ]
        for key in required_keys:
            if not getattr(self, key):
                raise ValueError(f"Missing required environment variable: {key}")
            
settings = Settings()