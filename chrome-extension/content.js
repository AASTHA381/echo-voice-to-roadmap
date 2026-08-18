// SVG Icon Assets
const logoSvg = `
  <svg class="echo-logo-icon" viewBox="0 0 24 24" width="13" height="13" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2v20M17 5v14M22 9v6M7 7v10M2 10v4"></path>
  </svg>
`;

const spinnerSvg = `
  <svg class="echo-spinner-icon" viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" style="animation: echo-spin 1s linear infinite;">
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)"></circle>
    <path d="M12 2a10 10 0 0 1 10 10"></path>
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
    border-radius: 12px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
    outline: none;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .echo-float-widget:hover {
    border-color: rgba(168, 85, 247, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(168, 85, 247, 0.12), 0 10px 30px rgba(0, 0, 0, 0.4);
  }

  .echo-float-widget:active {
    transform: translateY(0);
  }

  .echo-logo-icon {
    stroke: #c084fc;
    transition: stroke 0.3s ease;
  }

  .echo-brand {
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 2px;
    color: #ffffff;
    text-transform: uppercase;
    transition: color 0.3s ease;
  }

  .echo-timer {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    font-weight: 700;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
    padding: 1px 5px;
    border-radius: 4px;
    border: 1px solid rgba(239, 68, 68, 0.25);
    display: none;
    letter-spacing: 0.5px;
  }

  .echo-float-widget.recording {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
    animation: echo-glowing-red 2s infinite ease-in-out;
  }

  .echo-float-widget.recording .echo-logo-icon {
    stroke: #ef4444;
  }

  .echo-float-widget.recording .echo-brand {
    color: #ef4444;
  }

  .echo-float-widget.uploading {
    background: rgba(234, 179, 8, 0.1);
    border-color: rgba(234, 179, 8, 0.3);
    cursor: wait;
    pointer-events: none;
  }

  .echo-float-widget.uploading .echo-logo-icon {
    stroke: #eab308;
  }

  .echo-float-widget.uploading .echo-brand {
    color: #eab308;
  }

  .echo-spinner-container {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #eab308;
  }

  @keyframes echo-glowing-red {
    0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.1), 0 10px 30px rgba(0, 0, 0, 0.4); }
    50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.35), 0 10px 30px rgba(0, 0, 0, 0.4); }
    100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.1), 0 10px 30px rgba(0, 0, 0, 0.4); }
  }

  @keyframes echo-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

// Create widget container (as a unified button)
const widget = document.createElement("button");
widget.className = "echo-float-widget";
widget.id = "echoWidget";
widget.title = "Start Recording";
widget.innerHTML = `
  ${logoSvg}
  <span class="echo-brand">ECHO</span>
  <span class="echo-timer" id="echoTimer">00:00</span>
  <span class="echo-spinner-container" id="echoSpinner" style="display: none;">${spinnerSvg}</span>
`;
document.body.appendChild(widget);

const echoTimer = document.getElementById("echoTimer");
const echoSpinner = document.getElementById("echoSpinner");

widget.addEventListener("click", () => {
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
    widget.classList.add("recording");
    widget.title = "Stop Recording";
    echoTimer.style.display = "inline-block";
    
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
    widget.classList.remove("recording");
    widget.classList.add("uploading");
    widget.title = "Uploading call...";
    echoTimer.style.display = "none";
    echoSpinner.style.display = "inline-block";
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
        widget.classList.remove("uploading");
        widget.title = "Start Recording";
        echoSpinner.style.display = "none";
        
        // Open Vercel dashboard automatically
        window.open("https://echo-voice-to-roadmap-aastha381.vercel.app", "_blank");
      })
      .catch(err => {
        console.error("Upload failed:", err);
        widget.classList.remove("uploading");
        widget.title = "Start Recording";
        echoSpinner.style.display = "none";
        alert("⚠️ Echo Recorder: Upload to server failed. Please check your backend URL settings.");
      });
  });
}
