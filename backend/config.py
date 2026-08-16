import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    INDEX_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "index")

    def __init__(self):
        # Create directories if they do not exist
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)
        os.makedirs(self.INDEX_DIR, exist_ok=True)

settings = Settings()
