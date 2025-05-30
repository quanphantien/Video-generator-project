import os
from dotenv import load_dotenv

# Load các biến môi trường từ file .env
load_dotenv()

class Settings:
    def __init__(self):
        self.YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
        self.GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

        required_keys = [
            'YOUTUBE_API_KEY','GEMINI_API_KEY',
        ]
        for key in required_keys:
            if not getattr(self, key):
                raise ValueError(f"Missing required environment variable: {key}")
            
settings = Settings()


# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
# PLAY_HT_API_KEY = os.getenv("PLAY_HT_API_KEY", "")
# CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
# CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
# CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/ai_short_video")
# JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")