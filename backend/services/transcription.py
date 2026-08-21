import os
from typing import Dict, List, Any
from groq import Groq
from backend.config import settings

class TranscriptionService:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY:
            self.client = Groq(api_key=settings.GROQ_API_KEY)

    def transcribe_audio(self, file_path: str, prompt: str = None) -> Dict[str, Any]:
        """
        Transcribes audio using Groq Whisper API and returns the full text along with timestamped segments.
        """
        if not self.client:
            raise ValueError("Groq API Key is not configured. Please set GROQ_API_KEY in your .env file.")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        filename = os.path.basename(file_path)
        
        with open(file_path, "rb") as file:
            # We use verbose_json to get segment level timestamps
            kwargs = {
                "file": (filename, file.read()),
                "model": "whisper-large-v3",
                "response_format": "verbose_json"
            }
            if prompt:
                kwargs["prompt"] = prompt
                
            response = self.client.audio.transcriptions.create(**kwargs)
        
        # Parse output from verbose_json response
        # The response is typically a dict-like object containing segments and text
        full_text = getattr(response, "text", "")
        segments_raw = getattr(response, "segments", [])
        
        segments: List[Dict[str, Any]] = []
        for idx, seg in enumerate(segments_raw):
            if isinstance(seg, dict):
                start = seg.get("start", 0.0)
                end = seg.get("end", 0.0)
                text = seg.get("text", "")
            else:
                start = getattr(seg, "start", 0.0)
                end = getattr(seg, "end", 0.0)
                text = getattr(seg, "text", "")

            segments.append({
                "id": idx,
                "start": float(start if start is not None else 0.0),
                "end": float(end if end is not None else 0.0),
                "text": str(text if text is not None else "").strip(),
                "speaker": f"Speaker {((idx // 3) % 2) + 1}" # Simple semantic block alternating as default fallback
            })
            
        return {
            "text": full_text,
            "segments": segments
        }

transcription_service = TranscriptionService()
