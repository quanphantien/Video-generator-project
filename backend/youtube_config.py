# Configuration file for YouTube upload debugging

# Backend Configuration
BACKEND_URL = "http://127.0.0.1:8000"
UPLOAD_ENDPOINT = "/video/youtube/upload"
TEST_ENDPOINT = "/video/youtube/test-connection"

# YouTube API Configuration
YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
OAUTH_TOKEN_INFO = "https://www.googleapis.com/oauth2/v1/tokeninfo"

# Upload Limits
MAX_FILE_SIZE = 128 * 1024 * 1024 * 1024  # 128GB
MAX_DURATION_HOURS = 12
CHUNK_SIZE = 10 * 1024 * 1024  # 10MB
SMALL_FILE_THRESHOLD = 50 * 1024 * 1024  # 50MB

# Timeouts (seconds)
TOKEN_VALIDATION_TIMEOUT = 30
VIDEO_DOWNLOAD_TIMEOUT = 300
UPLOAD_INIT_TIMEOUT = 300
UPLOAD_CONTENT_TIMEOUT = 600
CHUNKED_UPLOAD_TIMEOUT = 900

# Retry Settings
MAX_DOWNLOAD_RETRIES = 3
MAX_UPLOAD_RETRIES = 2
RETRY_DELAY = 2  # seconds

# Required YouTube Scopes
REQUIRED_SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly"
]

# Supported Video Formats
SUPPORTED_FORMATS = [
    "video/mp4",
    "video/avi", 
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/webm"
]

# Debug Settings
DEBUG_MODE = True
LOG_REQUESTS = True
LOG_RESPONSES = True
