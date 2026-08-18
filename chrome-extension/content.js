// Styles for floating widget
const styles = `
  .echo-float-widget {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .echo-rec-btn {
    background: #a855f7;
    border: none;
    color: white;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background 0.2s;
  }
  .echo-rec-btn:hover {
    background: #9333ea;
  }
  .echo-rec-btn.recording {
    background: #ef4444;
  }
  .echo-rec-btn.recording:hover {
    background: #dc2626;
  }
  .echo-pulse-dot {
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    animation: echo-pulse 1s infinite alternate;
    display: none;
  }
  @keyframes echo-pulse {
    0% { transform: scale(0.8); opacity: 0.5; }
    100% { transform: scale(1.3); opacity: 1; }
  }
  .echo-timer {
    font-family: monospace;
    font-size: 12px;
    color: #94a3b8;
    display: none;
  }
  .echo-status {
    font-size: 11px;
    color: #a855f7;
    font-weight: 500;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Variables for recording
let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;
let recordingSeconds = 0;
let isRecording = false;

// Create widget container
const widget = document.createElement("div");
widget.className = "echo-float-widget";
widget.innerHTML = `
  <div class="echo-pulse-dot" id="echoDot"></div>
  <span class="echo-status" id="echoStatus">Echo Offline</span>
  <span class="echo-timer" id="echoTimer">00:00</span>
  <button class="echo-rec-btn" id="echoBtn">🎙️ Record Call</button>
`;
document.body.appendChild(widget);

const echoBtn = document.getElementById("echoBtn");
const echoStatus = document.getElementById("echoStatus");
const echoTimer = document.getElementById("echoTimer");
const echoDot = document.getElementById("echoDot");

// Update status to ready
echoStatus.textContent = "Echo Ready";

echoBtn.addEventListener("click", () => {
  if (!isRecording) {
    startMeetingRecording();
  } else {
    stopMeetingRecording();
  }
});

async function startMeetingRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    
    // Choose dynamic codecs
    let options = { mimeType: 'audio/webm' };
    if (typeof MediaRecorder.isTypeSupported === 'function') {
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/mp4' };
        if (!MediaRecorder.isTypeSupported('audio/mp4')) {
          options = {}; // fallback
        }
      }
    }

    mediaRecorder = new MediaRecorder(stream, options);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const mime = mediaRecorder.mimeType || 'audio/webm';
      let extension = 'webm';
      if (mime.includes('mp4') || mime.includes('aac') || mime.includes('m4a')) {
        extension = 'mp4';
      }
      
      const audioBlob = new Blob(audioChunks, { type: mime });
      const now = new Date();
      const dateStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');
      const timeStr = String(now.getHours()).padStart(2, '0') + "_" + String(now.getMinutes()).padStart(2, '0');
      const fileName = `Meeting_${dateStr}_${timeStr}.${extension}`;
      const audioFile = new File([audioBlob], fileName, { type: mime });
      
      // Stop all tracks to release mic
      stream.getTracks().forEach(track => track.stop());
      
      // Upload meeting audio
      uploadMeetingAudio(audioFile);
    };

    mediaRecorder.start(1000);
    isRecording = true;
    
    // UI state transitions
    echoBtn.textContent = "Stop & Transcribe";
    echoBtn.classList.add("recording");
    echoDot.style.display = "block";
    echoTimer.style.display = "inline";
    echoStatus.textContent = "Recording...";
    
    recordingSeconds = 0;
    recordingInterval = setInterval(() => {
      recordingSeconds++;
      const mins = Math.floor(recordingSeconds / 60);
      const secs = recordingSeconds % 60;
      echoTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);

  } catch (err) {
    console.error("Mic access failed:", err);
    alert("⚠️ Echo Recorder: Microphone access denied or not supported.");
  }
}

function stopMeetingRecording() {
  if (recordingSeconds < 3) {
    alert("⚠️ Recording is too short. Please record for at least 3 seconds.");
    return;
  }
  
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    
    clearInterval(recordingInterval);
    
    // Reset UI
    echoBtn.textContent = "🎙️ Record Call";
    echoBtn.classList.remove("recording");
    echoDot.style.display = "none";
    echoTimer.style.display = "none";
    echoStatus.textContent = "Uploading...";
  }
}

function uploadMeetingAudio(file) {
  // Get backend server URL from Chrome storage
  chrome.storage.local.get(['serverUrl'], (result) => {
    const serverUrl = result.serverUrl || 'https://echo-voice-to-roadmap-pgtn.onrender.com';
    
    const formData = new FormData();
    formData.append("file", file);
    
    fetch(`${serverUrl}/api/upload`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        echoStatus.textContent = "Upload Success!";
        setTimeout(() => {
          echoStatus.textContent = "Echo Ready";
        }, 3000);
        
        // Open Vercel dashboard automatically
        window.open("https://echo-voice-to-roadmap-aastha381.vercel.app", "_blank");
      })
      .catch(err => {
        console.error("Upload failed:", err);
        echoStatus.textContent = "Upload Failed";
        alert("⚠️ Echo Recorder: Upload to server failed. Please check your backend URL settings.");
        setTimeout(() => {
          echoStatus.textContent = "Echo Ready";
        }, 3000);
      });
  });
}
