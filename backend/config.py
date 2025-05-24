import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
PLAY_HT_API_KEY = os.getenv("PLAY_HT_API_KEY", "")
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/ai_short_video")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")