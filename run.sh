#!/bin/bash

# Terminate all child processes on script exit
trap "kill 0" EXIT

echo "🎙️ Starting Echo - Voice to Roadmap AI Copilot..."

# 1. Start Python Backend
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Ensuring backend dependencies are installed..."
pip install -r backend/requirements.txt

echo "🚀 Launching FastAPI backend on http://localhost:8000..."
export PYTHONPATH=.
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &

# 2. Start Vite Frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Node modules not found. Installing frontend packages..."
    cd frontend
    npm install
    cd ..
fi

echo "🚀 Launching Vite frontend on http://localhost:3001..."
cd frontend
npm run dev -- --port 3001 &

# Wait for both processes
wait
