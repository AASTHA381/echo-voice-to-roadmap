// SVG Icon Assets
const micSvg = `
  <svg class="echo-svg-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
  </svg>
`;

const stopSvg = `
  <svg class="echo-svg-icon" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
  </svg>
`;

// Styles for floating widget
const styles = `
  .echo-float-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 6px 8px 6px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .echo-float-widget:hover {
    border-color: rgba(168, 85, 247, 0.4);
    box-shadow: 0 12px 36px rgba(168, 85, 247, 0.12), 0 10px 30px rgba(0, 0, 0, 0.4);
  }

  .echo-status-container {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .echo-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .echo-status-dot.idle {
    background: #10b981;
    box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
  }

  .echo-status-dot.recording {
    background: #ef4444;
    box-shadow: 0 0 10px #ef4444;
    animation: echo-pulse 1.4s infinite ease-in-out;
  }

  .echo-status-dot.uploading {
    background: #eab308;
    box-shadow: 0 0 6px rgba(234, 179, 8, 0.6);
    animation: echo-pulse 1s infinite alternate;
  }

  @keyframes echo-pulse {
    0% { transform: scale(0.9); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.9); opacity: 0.6; }
  }

  .echo-status {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 600;
    letter-spacing: -0.1px;
    transition: color 0.3s ease;
  }

  .echo-status.recording-active {
    color: #f1f5f9;
  }

  .echo-timer {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    font-weight: 700;
    color: #c084fc;
    background: rgba(168, 85, 247, 0.15);
    padding: 1px 5px;
    border-radius: 4px;
    border: 1px solid rgba(168, 85, 247, 0.25);
    display: none;
    letter-spacing: 0.5px;
  }

  .echo-rec-btn {
    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
    border: none;
    color: #ffffff;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 11px;
    display: flex;
    align-items: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 3px 8px rgba(124, 58, 237, 0.2);
  }

  .echo-rec-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .echo-rec-btn:active {
    transform: translateY(1px);
  }

  .echo-rec-btn.recording {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    box-shadow: 0 3px 8px rgba(239, 68, 68, 0.2);
  }

  .echo-rec-btn.recording:hover {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
  <div class="echo-status-container">
    <div class="echo-status-dot idle" id="echoDot"></div>
    <span class="echo-status" id="echoStatus">Echo Ready</span>
  </div>
  <span class="echo-timer" id="echoTimer">00:00</span>
  <button class="echo-rec-btn" id="echoBtn">${micSvg}Record Call</button>
`;
document.body.appendChild(widget);

const echoBtn = document.getElementById("echoBtn");
const echoStatus = document.getElementById("echoStatus");
const echoTimer = document.getElementById("echoTimer");
const echoDot = document.getElementById("echoDot");

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
    echoBtn.innerHTML = `${stopSvg}Stop & Transcribe`;
    echoBtn.classList.add("recording");
    
    echoDot.className = "echo-status-dot recording";
    echoTimer.style.display = "inline-block";
    echoStatus.textContent = "Recording";
    echoStatus.classList.add("recording-active");
    
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
    
    // Reset UI to uploading status
    echoBtn.innerHTML = `${micSvg}Record Call`;
    echoBtn.classList.remove("recording");
    
    echoDot.className = "echo-status-dot uploading";
    echoTimer.style.display = "none";
    echoStatus.textContent = "Uploading...";
    echoStatus.classList.remove("recording-active");
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
        echoDot.className = "echo-status-dot idle";
        echoStatus.textContent = "Upload Success!";
        setTimeout(() => {
          echoStatus.textContent = "Echo Ready";
        }, 3000);
        
        // Open Vercel dashboard automatically
        window.open("https://echo-voice-to-roadmap-aastha381.vercel.app", "_blank");
      })
      .catch(err => {
        console.error("Upload failed:", err);
        echoDot.className = "echo-status-dot idle";
        echoStatus.textContent = "Upload Failed";
        alert("⚠️ Echo Recorder: Upload to server failed. Please check your backend URL settings.");
        setTimeout(() => {
          echoStatus.textContent = "Echo Ready";
        }, 3000);
      });
  });
}

