import os
import uuid
import json
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.config import settings
from backend.services.transcription import transcription_service
from backend.services.vector_store import vector_store_service
from backend.services.analyzer import analyzer_service

app = FastAPI(title="Echo - Voice to Roadmap AI Copilot API")

# Mount uploads folder so the audio player can stream the recordings
app.mount("/api/audio", StaticFiles(directory=settings.UPLOAD_DIR), name="audio")

# Configure CORS so our React frontend can connect securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local dev, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registry file for transcript metadata
REGISTRY_PATH = os.path.join(settings.INDEX_DIR, "registry.json")

def load_registry() -> List[Dict[str, Any]]:
    if not os.path.exists(REGISTRY_PATH):
        return []
    try:
        with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_registry(data: List[Dict[str, Any]]) -> None:
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Input schemas for endpoints
class PRDRequest(BaseModel):
    selected_features: List[Dict[str, Any]]
    selected_pain_points: List[Dict[str, Any]]
    mode: str = "software"

# Mock Interview data for zero-config fallback
MOCK_TRANSCRIPT_SEGMENTS = [
    {"id": 0, "start": 0.0, "end": 6.2, "speaker": "Interviewer", "text": "Hi Sarah, thank you for joining our feedback session. Can you tell me about your experience checking out on EchoShop?"},
    {"id": 1, "start": 6.8, "end": 14.5, "speaker": "Sarah (User)", "text": "Yeah, so overall the site looks amazing. But when I was ready to buy, I really struggled. I had three items in my cart, but I spent at least two minutes looking for the checkout button."},
    {"id": 2, "start": 15.0, "end": 21.3, "speaker": "Sarah (User)", "text": "It is buried somewhere at the bottom of the page, below the promo banners, and the gray color doesn't stand out at all. I thought it was disabled."},
    {"id": 3, "start": 21.8, "end": 26.0, "speaker": "Interviewer", "text": "Got it, so the button was hard to locate. Once you clicked it, how was the flow?"},
    {"id": 4, "start": 26.5, "end": 35.8, "speaker": "Sarah (User)", "text": "Oh, that was frustrating. The credit card validation took forever. It kept spinning, and there was no spinner or loading text, so I thought the app crashed."},
    {"id": 5, "start": 36.2, "end": 44.0, "speaker": "Sarah (User)", "text": "I almost closed my browser window. Also, I hate entering my credit card digits manually every time. Why don't you guys support Google Pay or Apple Pay?"},
    {"id": 6, "start": 44.5, "end": 48.2, "speaker": "Interviewer", "text": "That makes sense. Google Pay and Apple Pay would save a lot of typing. Anything else?"},
    {"id": 7, "start": 48.8, "end": 56.5, "speaker": "Sarah (User)", "text": "On mobile, the form is just so long. It would be amazing if the cart summary was sticky or floated at the top, so I could see my items while filling out shipping details."},
]

MOCK_PAIN_POINTS = [
    {
        "id": "pp_1",
        "title": "Low Visibility Checkout Button",
        "description": "The checkout button is styled in a muted gray color and placed below secondary promotional banners, causing extreme discoverability issues.",
        "severity": "High",
        "citations": [
            { "segment_id": 1, "timestamp": "6.80s - 14.50s", "speaker": "Sarah (User)", "quote": "I had three items in my cart, but I spent at least two minutes looking for the checkout button." },
            { "segment_id": 2, "timestamp": "15.00s - 21.30s", "speaker": "Sarah (User)", "quote": "It is buried somewhere at the bottom of the page, below the promo banners, and the gray color doesn't stand out at all." }
        ]
    },
    {
        "id": "pp_2",
        "title": "No Loading States During Payment Processing",
        "description": "Credit card validation does not display a loading spinner or progress indicator, leading users to believe the application has crashed.",
        "severity": "High",
        "citations": [
            { "segment_id": 4, "timestamp": "26.50s - 35.80s", "speaker": "Sarah (User)", "quote": "The credit card validation took forever. It kept spinning, and there was no spinner or loading text, so I thought the app crashed." }
        ]
    }
]

MOCK_FEATURES = [
    {
        "id": "feat_1",
        "title": "One-Click Mobile Wallets (Google Pay & Apple Pay)",
        "description": "Integrate Apple Pay and Google Pay to bypass manual card number entry, speeding up transaction time and reducing cart abandonment.",
        "citations": [
            { "segment_id": 5, "timestamp": "36.20s - 44.00s", "speaker": "Sarah (User)", "quote": "I hate entering my credit card digits manually every time. Why don't you guys support Google Pay or Apple Pay?" }
        ],
        "rice": { "reach": 9, "impact": 3.0, "confidence": 0.9, "effort": 2, "score": 12.15 },
        "moscow": "Must-have"
    },
    {
        "id": "feat_2",
        "title": "Sticky Order Summary Sidebar",
        "description": "Implement a persistent, floating order summary component on checkout pages so users maintain visibility of cart items and total cost as they fill shipping details.",
        "citations": [
            { "segment_id": 7, "timestamp": "48.80s - 56.50s", "speaker": "Sarah (User)", "quote": "It would be amazing if the cart summary was sticky or floated at the top, so I could see my items while filling out shipping details." }
        ],
        "rice": { "reach": 7, "impact": 1.5, "confidence": 0.8, "effort": 1, "score": 8.4 },
        "moscow": "Should-have"
    }
]

@app.get("/api/health")
def health_check():
    has_key = bool(settings.GROQ_API_KEY)
    return {
        "status": "healthy",
        "groq_api_configured": has_key,
        "mode": "Live Production" if has_key else "Interactive Demo/Fallback"
    }

@app.post("/api/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    Accepts raw audio file. Transcribes it (using Groq Whisper or fallback demo)
    and indexes segments inside the vector store.
    """
    # Create unique ID for this transcript
    transcript_id = str(uuid.uuid4())
    filename = file.filename or "interview.wav"
    
    # Save the file temporarily
    file_path = os.path.join(settings.UPLOAD_DIR, f"{transcript_id}_{filename}")
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    try:
        # Check if Groq API key is present
        if not settings.GROQ_API_KEY:
            # Fallback to Mock Data (No API cost, instant setup)
            transcription_results = {
                "text": " ".join([seg["text"] for seg in MOCK_TRANSCRIPT_SEGMENTS]),
                "segments": MOCK_TRANSCRIPT_SEGMENTS
            }
        else:
            # Live Groq Whisper transcription
            transcription_results = transcription_service.transcribe_audio(file_path)
            
        # Add to vector store
        vector_store_service.add_transcript(transcript_id, transcription_results["segments"])
        
        # Save transcript to registry
        registry = load_registry()
        duration = transcription_results["segments"][-1]["end"] if transcription_results["segments"] else 0.0
        
        transcript_meta = {
            "id": transcript_id,
            "filename": filename,
            "uploaded_at": datetime.now().isoformat(),
            "duration": round(duration, 2),
            "text": transcription_results["text"],
            "segments": transcription_results["segments"],
            "audio_filename": f"{transcript_id}_{filename}"
        }
        registry.append(transcript_meta)
        save_registry(registry)
        
        return transcript_meta

    except Exception as e:
        # Clean up uploaded file if process failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/transcripts")
def get_transcripts():
    """
    Returns list of all uploaded and indexed transcripts.
    """
    registry = load_registry()
    # Return brief metadata list (exclude full segments for lighter weight)
    return [
        {
            "id": item["id"],
            "filename": item["filename"],
            "uploaded_at": item["uploaded_at"],
            "duration": item["duration"],
            "audio_filename": item.get("audio_filename", f"{item['id']}_{item['filename']}")
        }
        for item in registry
    ]

@app.get("/api/transcripts/{transcript_id}")
def get_transcript(transcript_id: str):
    """
    Returns all data for a specific transcript.
    """
    registry = load_registry()
    for item in registry:
        if item["id"] == transcript_id:
            if "audio_filename" not in item:
                item["audio_filename"] = f"{item['id']}_{item['filename']}"
            return item
    raise HTTPException(status_code=404, detail="Transcript not found")

@app.delete("/api/transcripts/{transcript_id}")
def delete_transcript(transcript_id: str):
    """
    Deletes a transcript from the registry, removes its vector store index file,
    and deletes the uploaded audio file from disk.
    """
    registry = load_registry()
    target_item = None
    for item in registry:
        if item["id"] == transcript_id:
            target_item = item
            break
            
    if not target_item:
        raise HTTPException(status_code=404, detail="Transcript not found")
        
    # Remove from registry list
    registry = [item for item in registry if item["id"] != transcript_id]
    save_registry(registry)
    
    # Remove vector store index file
    vector_store_service.delete_transcript(transcript_id)
    
    # Delete uploaded audio file
    audio_filename = target_item.get("audio_filename", f"{transcript_id}_{target_item['filename']}")
    audio_path = os.path.join(settings.UPLOAD_DIR, audio_filename)
    if os.path.exists(audio_path):
        try:
            os.remove(audio_path)
        except Exception as e:
            print(f"Error deleting audio file: {e}")
            
    return {"status": "success", "message": f"Deleted transcript {transcript_id}"}

@app.post("/api/analyze/{transcript_id}")
def analyze_transcript(transcript_id: str):
    """
    Analyzes the transcribed interview to extract grounded pain points and prioritized roadmap features.
    """
    # Verify transcript exists
    registry = load_registry()
    transcript_exists = any(item["id"] == transcript_id for item in registry)
    if not transcript_exists:
        raise HTTPException(status_code=404, detail="Transcript index not found")

    try:
        if not settings.GROQ_API_KEY:
            # Standard Mock fallback
            return {
                "pain_points": MOCK_PAIN_POINTS,
                "features": MOCK_FEATURES
            }
            
        # Call the live Groq RAG analysis pipeline
        return analyzer_service.analyze_transcript(transcript_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/prd/{transcript_id}")
def generate_prd(transcript_id: str, request: PRDRequest):
    """
    Generates a draft Markdown PRD based on selected features and pain points.
    """
    try:
        if not settings.GROQ_API_KEY:
            # Generates a standard mock PRD in markdown
            mock_prd = (
                "# Product Requirement Document: EchoShop Checkout Friction Fixes\n\n"
                "## 1. Executive Summary\n"
                "EchoShop is experiencing checkout abandonment due to a combination of payment gate delays "
                "and button layout visibility issues. This document specifies features to introduce one-click "
                "mobile wallets and standard sticky cart UI layouts to improve checkout conversion rates.\n\n"
                "## 2. Problem Statement\n"
                "According to qualitative customer interviews, users struggle to identify the checkout path and "
                "express frustration at manual credit card entry. \n"
                "For instance, one interviewee stated: *\"I had three items in my cart, but I spent at least two minutes "
                "looking for the checkout button.\"*\n\n"
                "## 3. Product Goals\n"
                "- Reduce cart checkout duration by 40%.\n"
                "- Decrease shopping cart drop-off rate by 15%.\n"
                "- Integrate seamless loading indicators for transparency.\n\n"
                "## 4. Requirements & MoSCoW Backlog\n"
                "| ID | Feature Name | Description | Priority | User Story |\n"
                "| --- | --- | --- | --- | --- |\n"
                "| F-01 | Apple/Google Pay Integration | Support mobile wallets on checkout | Must-have | *As a mobile shopper, I want to pay with Google Pay so I don't type my card details.* |\n"
                "| F-02 | Sticky Order Summary | Float order total summary on shipping form | Should-have | *As a desktop user, I want to see my order total so I feel secure during checkout.* |\n"
            )
            return {"prd": mock_prd}
            
        prd_text = analyzer_service.generate_prd(
            transcript_id=transcript_id,
            selected_features=request.selected_features,
            selected_pain_points=request.selected_pain_points,
            mode=request.mode
        )
        return {"prd": prd_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
