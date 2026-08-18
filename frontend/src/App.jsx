import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, FileText, PieChart, BookOpen, Download, 
  Play, Pause, Plus, Minus, Check, CheckCircle, 
  ExternalLink, AlertTriangle, FileSpreadsheet, Sparkles, 
  RefreshCw, Music, Copy, Trash2, Mic, Cpu, ListChecks
} from 'lucide-react';

export default function App() {
  const API_BASE = import.meta.env.VITE_API_URL || 'https://echo-voice-to-roadmap-pgtn.onrender.com';

  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState('transcript'); // transcript | insights | backlog | prd
  
  // API Config / Environment States
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Transcripts list and selection
  const [transcripts, setTranscripts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTranscript, setActiveTranscript] = useState(null);

  // Interaction States
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPrdLoading, setIsPrdLoading] = useState(false);

  // Extracted Data States
  const [insights, setInsights] = useState({ pain_points: [], features: [] });
  const [selectedPainPoints, setSelectedPainPoints] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [prd, setPrd] = useState('');

  // Audio Sync Player State
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSegmentId, setActiveSegmentId] = useState(null);
  const audioRef = useRef(null);

  // Flash highlight state for RAG citation jumps
  const [highlightedSegmentId, setHighlightedSegmentId] = useState(null);

  // Live Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // File rename modal state
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFileName, setPendingFileName] = useState('');
  const [serverWaking, setServerWaking] = useState(false); // shows 'server warming' hint during slow calls

  // Fetch API Health & Loaded Transcripts
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(res => res.json())
      .then(data => {
        setIsDemoMode(!data.groq_api_configured);
      })
      .catch(() => setIsDemoMode(true));

    refreshTranscriptsList();
  }, []);

  // Keep-alive ping every 4 minutes so Render never cold-starts mid-session
  useEffect(() => {
    const keepAlive = setInterval(() => {
      fetch(`${API_BASE}/api/health`).catch(() => {});
    }, 4 * 60 * 1000);
    return () => clearInterval(keepAlive);
  }, []);

  // Update transcript view when selectedId changes
  useEffect(() => {
    if (selectedId) {
      fetch(`${API_BASE}/api/transcripts/${selectedId}`)
        .then(res => res.json())
        .then(data => {
          setActiveTranscript(data);
          // Set active audio url from backend static folder
          if (data.audio_filename) {
            const audioBase = API_BASE || 'http://localhost:8000';
            setAudioUrl(`${audioBase}/api/audio/${data.audio_filename}`);
          } else {
            setAudioUrl(null);
          }
          setInsights({ pain_points: [], features: [] });
          setPrd('');
          setSelectedFeatures([]);
          setSelectedPainPoints([]);
          setActiveTab('transcript');
        })
        .catch(err => console.error("Error fetching transcript:", err));
    }
  }, [selectedId]);

  // Synchronize playing segment with current audio time
  useEffect(() => {
    if (activeTranscript && activeTranscript.segments) {
      const match = activeTranscript.segments.find(
        seg => currentTime >= seg.start && currentTime <= seg.end
      );
      if (match) {
        setActiveSegmentId(match.id);
      } else {
        setActiveSegmentId(null);
      }
    }
  }, [currentTime, activeTranscript]);

  const refreshTranscriptsList = () => {
    fetch(`${API_BASE}/api/transcripts`)
      .then(res => res.json())
      .then(data => {
        setTranscripts(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      })
      .catch(err => console.error("Error listing transcripts:", err));
  };

  // Audio timeline sync controllers
  const playPauseAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play deferred:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (seconds, segmentId) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      if (!isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play deferred:", e));
        setIsPlaying(true);
      }
    }
    setCurrentTime(seconds);
    setActiveSegmentId(segmentId);
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // RAG Citation: Jump straight to the source quote in the transcript tab
  const jumpToCitation = (segmentId, startSec) => {
    setActiveTab('transcript');
    seekTo(startSec, segmentId);
    setHighlightedSegmentId(segmentId);
    
    // Smooth scroll to the cited segment card
    setTimeout(() => {
      const element = document.getElementById(`segment-${segmentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Remove flash highlight class after 3 seconds
    setTimeout(() => {
      setHighlightedSegmentId(null);
    }, 3000);
  };

  // File Upload Handler — shows rename dialog first
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // reset input so same file can be re-selected

    if (file.size > 25 * 1024 * 1024) {
      alert("⚠️ File exceeds 25MB limit. Please compress your audio or upload in smaller clips.");
      return;
    }

    // Show rename modal before uploading
    const base = file.name.replace(/\.[^.]+$/, '');
    setPendingFile(file);
    setPendingFileName(base);
  };

  // Live Meeting Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      // Priority order of MIME types — most compatible first for iOS/Android/Desktop
      const mimeTypes = [
        'audio/webm;codecs=opus',  // Chrome/Firefox desktop
        'audio/webm',               // Chrome desktop fallback
        'audio/mp4;codecs=mp4a.40.2', // iOS Safari
        'audio/mp4',               // iOS Safari fallback
        'audio/ogg;codecs=opus',   // Firefox
        'audio/ogg',               // Firefox fallback
      ];

      let selectedMime = '';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        for (const mime of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mime)) {
            selectedMime = mime;
            break;
          }
        }
      }

      // Build options — if no supported MIME found, let browser decide
      const options = selectedMime ? { mimeType: selectedMime } : {};
      
      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        // Detect actual mimeType from the recorder (may differ from what we requested)
        const actualMimeType = recorder.mimeType || selectedMime || 'audio/mp4';
        
        // Map mimeType to correct file extension
        let extension = 'mp4'; // safe default — Groq supports mp4
        if (actualMimeType.includes('webm')) {
          extension = 'webm';
        } else if (actualMimeType.includes('ogg')) {
          extension = 'ogg';
        } else if (actualMimeType.includes('wav')) {
          extension = 'wav';
        } else if (actualMimeType.includes('mp4') || actualMimeType.includes('aac') || actualMimeType.includes('m4a')) {
          extension = 'mp4';
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });

        // Guard: check blob is not empty
        if (audioBlob.size < 100) {
          alert('⚠️ Recording captured no audio data. Please check your microphone permissions and try again.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        const now = new Date();
        const dateStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') + "_" + String(now.getMinutes()).padStart(2, '0');
        const defaultName = `Live_Meeting_${dateStr}_${timeStr}`;
        const audioFile = new File([audioBlob], `${defaultName}.${extension}`, { type: actualMimeType });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Show rename modal before uploading
        setPendingFile(audioFile);
        setPendingFileName(defaultName);
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Capture chunks every 1 second
      
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Recording error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert("⚠️ Microphone access denied.\n\nPlease go to your browser Settings → Site Permissions → Microphone and allow access for this site, then try again.");
      } else if (err.name === 'NotFoundError') {
        alert("⚠️ No microphone found. Please connect a microphone and try again.");
      } else {
        alert("⚠️ Could not start recording: " + err.message);
      }
    }
  };

  const stopRecording = () => {
    if (recordingTime < 3) {
      alert("⚠️ Recording is too short. Please record for at least 3 seconds to generate a valid audio file.");
      return;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Disable onstop so we don't trigger upload
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      
      // Stop all mic tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const uploadRecordedFile = (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.detail || 'Upload server returned an error.');
          });
        }
        return res.json();
      })
      .then(data => {
        setIsUploading(false);
        refreshTranscriptsList();
        setSelectedId(data.id);
      })
      .catch(err => {
        setIsUploading(false);
        alert("⚠️ Upload failed. Error: " + err.message);
      });
  };

  // Confirm rename and start the actual upload
  const confirmAndUpload = () => {
    if (!pendingFile) return;
    const originalExt = pendingFile.name.match(/\.[^.]+$/)?.[0] || '';
    const cleanName = (pendingFileName.trim() || 'Recording') + originalExt;
    const renamedFile = new File([pendingFile], cleanName, { type: pendingFile.type });
    setPendingFile(null);
    setPendingFileName('');
    uploadRecordedFile(renamedFile);
  };

  const formatRecordingTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleDeleteTranscript = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this transcript? This action cannot be undone.")) {
      fetch(`${API_BASE}/api/transcripts/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          refreshTranscriptsList();
          if (selectedId === id) {
            setSelectedId(null);
            setActiveTranscript(null);
            setAudioUrl(null);
            setInsights({ pain_points: [], features: [] });
            setPrd('');
            setSelectedFeatures([]);
            setSelectedPainPoints([]);
          }
        })
        .catch(err => console.error("Error deleting transcript:", err));
    }
  };

  // LLM Insight Generation (Pain Points & Feature Backlog)
  const runRAGAnalysis = async () => {
    if (!selectedId) return;
    setIsAnalyzing(true);
    setServerWaking(true);

    try {
      // Step 1: Warm-up ping — ensure Render server is awake before the heavy analyze call
      try {
        await fetch(`${API_BASE}/api/health`, { method: 'GET' });
      } catch (_) {
        // ignore warm-up failure, proceed anyway
      }
      setServerWaking(false);

      // Step 2: Run analysis with a generous 90-second timeout (Groq + RAG can be slow)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const res = await fetch(`${API_BASE}/api/analyze/${selectedId}`, {
        method: 'POST',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ detail: `Server error ${res.status}` }));
        throw new Error(errBody.detail || `Server returned ${res.status}`);
      }

      const data = await res.json();
      setIsAnalyzing(false);
      setInsights(data || { pain_points: [], features: [] });
      setSelectedPainPoints(data?.pain_points || []);
      setSelectedFeatures(data?.features || []);
      setActiveTab('insights');

    } catch (err) {
      setIsAnalyzing(false);
      setServerWaking(false);
      if (err.name === 'AbortError') {
        alert("⚠️ Analysis timed out.\n\nThe AI server took too long. This usually happens on first load (server wakes up). Please wait 10 seconds and try again — it will be faster on the second attempt.");
      } else {
        alert("⚠️ Analysis failed: " + err.message + "\n\nPlease check your connection and try again.");
      }
    }
  };

  // Dynamic PRD/Research Brief Generation
  const generatePRD = async () => {
    if (!selectedId) return;
    setIsPrdLoading(true);
    setServerWaking(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const res = await fetch(`${API_BASE}/api/prd/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_features: selectedFeatures,
          selected_pain_points: selectedPainPoints,
          mode: insights.mode || 'software'
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      setServerWaking(false);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ detail: `Server error ${res.status}` }));
        throw new Error(errBody.detail || `Server returned ${res.status}`);
      }

      const data = await res.json();
      setIsPrdLoading(false);
      setPrd(data.prd);
      setActiveTab('prd');

    } catch (err) {
      setIsPrdLoading(false);
      setServerWaking(false);
      if (err.name === 'AbortError') {
        alert("⚠️ Document generation timed out.\n\nThe AI server took too long. Please wait 10 seconds and try again.");
      } else {
        alert("⚠️ Document generation failed: " + err.message);
      }
    }
  };

  // Toggle selection checklists for PRD scope
  const toggleFeatureSelect = (feat) => {
    const isSelected = selectedFeatures.some(f => f.id === feat.id);
    if (isSelected) {
      setSelectedFeatures(selectedFeatures.filter(f => f.id !== feat.id));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const togglePainSelect = (pp) => {
    const isSelected = selectedPainPoints.some(p => p.id === pp.id);
    if (isSelected) {
      setSelectedPainPoints(selectedPainPoints.filter(p => p.id !== pp.id));
    } else {
      setSelectedPainPoints([...selectedPainPoints, pp]);
    }
  };

  // Edit RICE framework values directly inside the roadmap spreadsheet
  const updateRiceValue = (featId, metric, amount) => {
    const updatedFeatures = insights.features.map(f => {
      if (f.id === featId) {
        const rice = { ...f.rice };
        let newVal = Number(rice[metric]) + amount;
        
        // Boundaries
        if (metric === 'reach') newVal = Math.max(1, Math.min(10, Math.round(newVal)));
        if (metric === 'impact') newVal = Math.max(0.25, Math.min(3.0, Math.round(newVal * 4) / 4));
        if (metric === 'confidence') newVal = Math.max(0.1, Math.min(1.0, Math.round(newVal * 10) / 10));
        if (metric === 'effort') newVal = Math.max(1, Math.min(5, Math.round(newVal)));

        rice[metric] = newVal;
        rice.score = Math.round(((rice.reach * rice.impact * rice.confidence) / rice.effort) * 100) / 100;
        
        return { ...f, rice };
      }
      return f;
    });

    setInsights({ ...insights, features: updatedFeatures });
    
    // Also sync selectedFeatures list
    const updatedSelected = selectedFeatures.map(f => {
      const match = updatedFeatures.find(uf => uf.id === f.id);
      return match || f;
    });
    setSelectedFeatures(updatedSelected);
  };

  // MoSCoW direct toggler in table
  const cycleMoscow = (featId) => {
    const categories = ["Must-have", "Should-have", "Could-have", "Won't-have"];
    const updatedFeatures = insights.features.map(f => {
      if (f.id === featId) {
        const currentIdx = categories.indexOf(f.moscow);
        const nextIdx = (currentIdx + 1) % categories.length;
        return { ...f, moscow: categories[nextIdx] };
      }
      return f;
    });
    setInsights({ ...insights, features: updatedFeatures });
    
    const updatedSelected = selectedFeatures.map(f => {
      const match = updatedFeatures.find(uf => uf.id === f.id);
      return match || f;
    });
    setSelectedFeatures(updatedSelected);
  };

  // CSV Exporter for prioritized backlog
  const exportToCSV = () => {
    if (selectedFeatures.length === 0) {
      alert("Please select at least one feature backlog item to export.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Feature ID,Feature Title,Description,MoSCoW,Reach,Impact,Confidence,Effort,RICE Score\n";

    selectedFeatures.forEach(f => {
      const row = `"${f.id}","${f.title.replace(/"/g, '""')}","${f.description.replace(/"/g, '""')}","${f.moscow}",${f.rice.reach},${f.rice.impact},${f.rice.confidence},${f.rice.effort},${f.rice.score}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `echo_roadmap_${selectedTranscript?.filename || 'backlog'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Markdown to Clipboard
  const copyPrdToClipboard = () => {
    navigator.clipboard.writeText(prd);
    alert("📋 PRD copied to clipboard!");
  };

  // Download Markdown file
  const downloadPrdMarkdown = () => {
    const blob = new Blob([prd], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PRD_${selectedTranscript?.filename || 'echo_copilot'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedTranscript = transcripts.find(t => t.id === selectedId);

  return (
    <div className="echo-app dark-theme">
      {/* Background Neon Gradients */}
      <div className="glow-orb main-orb"></div>
      <div className="glow-orb secondary-orb"></div>

      {/* Top Demo Banner */}
      {isDemoMode && (
        <div className="demo-banner">
          <div className="demo-badge">
            <Sparkles className="icon-tiny animate-spin-slow" /> DEMO MODE
          </div>
          <span className="demo-banner-text">
            Using local mockups for Whisper and Groq LLM logic (Zero-Config). Provide a <code>GROQ_API_KEY</code> in a <code>.env</code> file to unlock live integrations!
          </span>
        </div>
      )}

      {/* App Header */}
      <header className="app-header">
        <div className="logo-wrapper">
          <div className="logo-icon-container">
            <Music className="logo-icon" />
          </div>
          <div>
            <h1>Echo</h1>
            <p className="subtitle">Voice-to-Roadmap AI Copilot</p>
          </div>
        </div>

        {/* Global Controls & Selected Document Details */}
        <div className="header-actions">
          {selectedTranscript && (
            <div className="active-doc-chip">
              <FileText className="icon-small text-indigo" />
              <span className="doc-name truncate">{selectedTranscript.filename}</span>
              <span className="doc-duration">({selectedTranscript.duration}s)</span>
            </div>
          )}

          <button 
            className="btn btn-secondary btn-record"
            onClick={startRecording}
            disabled={isUploading || isRecording}
            style={{ marginRight: '10px' }}
          >
            <Mic className="icon-medium text-purple" />
            Record
          </button>
          <label className="btn btn-primary btn-upload">
            <UploadCloud className="icon-medium" />
            Upload Interview
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileUpload} 
              disabled={isUploading}
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </header>

      {/* Live Recording Modal Overlay */}
      {isRecording && (
        <div className="recording-modal-overlay">
          <div className="recording-modal glass">
            <div className="recording-pulse-wrapper">
              <div className="recording-dot"></div>
              <div className="recording-pulse-ring"></div>
            </div>
            
            <h2>Recording Live Meeting...</h2>
            <div className="recording-timer">{formatRecordingTime(recordingTime)}</div>
            
            {/* Waveform Visualizer */}
            <div className="recording-waveform">
              <span className="wave-bar bar-1"></span>
              <span className="wave-bar bar-2"></span>
              <span className="wave-bar bar-3"></span>
              <span className="wave-bar bar-4"></span>
              <span className="wave-bar bar-5"></span>
              <span className="wave-bar bar-6"></span>
              <span className="wave-bar bar-7"></span>
              <span className="wave-bar bar-8"></span>
            </div>
            
            <p className="recording-note">Speak clearly. We will capture and transcribe your meeting in the background.</p>
            
            <div className="recording-actions">
              <button className="btn btn-danger" onClick={stopRecording}>
                <CheckCircle className="icon-medium" /> Stop & Transcribe
              </button>
              <button className="btn btn-outline" onClick={cancelRecording}>
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isUploading && (
        <div className="loading-overlay">
          <div className="loading-card glass">
            <RefreshCw className="icon-large animate-spin text-purple" />
            <h2>Transcribing Audio File...</h2>
            <p>Whisper is converting your qualitative interview into timestamped transcript blocks.</p>
          </div>
        </div>
      )}

      {/* File Rename Modal */}
      {pendingFile && (
        <div className="recording-modal-overlay">
          <div className="recording-modal glass rename-modal">
            <div className="rename-icon-wrap">
              <FileText className="rename-icon" />
            </div>
            <h2>Name Your Recording</h2>
            <p className="recording-note">Give this file a meaningful name so you can identify it later.</p>
            <input
              className="rename-input"
              type="text"
              value={pendingFileName}
              onChange={(e) => setPendingFileName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmAndUpload(); }}
              placeholder="e.g. User Interview - John"
              autoFocus
            />
            <div className="recording-actions">
              <button className="btn btn-primary" onClick={confirmAndUpload}>
                <UploadCloud className="icon-medium" /> Upload & Transcribe
              </button>
              <button className="btn btn-outline" onClick={() => { setPendingFile(null); setPendingFileName(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="app-main-layout">
        
        {/* Left Sidebar: Transcript Navigation Shelf */}
        <aside className="sidebar glass">
          <div className="sidebar-header">
            <h3>Recent Interviews</h3>
            <span className="count-badge">{transcripts.length}</span>
          </div>

          <div className="transcript-list">
            {transcripts.length === 0 ? (
              <div className="empty-list-prompt">
                <UploadCloud className="icon-large opacity-40 mb-2" />
                <p>No audio files uploaded yet.</p>
              </div>
            ) : (
              transcripts.map((t) => (
                <div 
                  key={t.id} 
                  className={`transcript-item-card ${selectedId === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="card-top">
                    <span className="filename text-ellipsis" title={t.filename}>{t.filename}</span>
                    <button 
                      className="delete-card-btn"
                      onClick={(e) => handleDeleteTranscript(t.id, e)}
                      title="Delete Transcript"
                    >
                      <Trash2 className="icon-tiny" />
                    </button>
                  </div>
                  <div className="card-bottom">
                    <span className="time-badge">{t.duration}s</span>
                    <span className="date-badge">
                      {new Date(t.uploaded_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {selectedTranscript && (
            <div className="sidebar-footer">
              <button 
                className="btn btn-secondary w-full"
                onClick={runRAGAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="icon-medium animate-spin" />
                    {serverWaking ? 'Waking server...' : 'Extracting Insights...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="icon-medium text-pink" />
                    Analyze with RAG
                  </>
                )}
              </button>
              {isAnalyzing && (
                <p style={{fontSize:'11px', color:'#94a3b8', textAlign:'center', marginTop:'6px', lineHeight:1.4}}>
                  ⏳ AI is reading your transcript. Takes 15–30s on first run.
                </p>
              )}
            </div>
          )}

          <div className="sidebar-integrations">
            <a 
              href={`${API_BASE}/api/extension/download`} 
              className="btn btn-outline btn-extension w-full"
              download
            >
              <Cpu className="icon-small text-purple" /> Get Chrome Extension
            </a>
          </div>
        </aside>

        {/* Right Content Space */}
        <section className="content-pane">
          {selectedTranscript ? (
            <>
              {/* Tab Navigation Menu */}
              <nav className="tab-menu glass">
                <button 
                  className={`tab-btn ${activeTab === 'transcript' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transcript')}
                >
                  <FileText className="icon-small" /> Transcript
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                  disabled={!insights?.pain_points?.length && !insights?.features?.length}
                  onClick={() => setActiveTab('insights')}
                >
                  <Sparkles className="icon-small" /> Insights
                  {(insights?.pain_points?.length > 0 || insights?.features?.length > 0) && (
                    <span className="indicator-dot"></span>
                  )}
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'backlog' ? 'active' : ''}`}
                  disabled={!insights?.features?.length}
                  onClick={() => setActiveTab('backlog')}
                >
                  <PieChart className="icon-small" /> Backlog
                  {insights?.features?.length > 0 && (
                    <span className="indicator-dot"></span>
                  )}
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'prd' ? 'active' : ''}`}
                  disabled={!prd}
                  onClick={() => setActiveTab('prd')}
                >
                  <BookOpen className="icon-small" /> PRD Draft
                  {prd && <span className="indicator-dot" style={{background:'#10b981'}}></span>}
                </button>
              </nav>

              {/* Tab Content Rendering */}
              <div className="tab-viewport">
                
                {/* 1. Transcript Tab */}
                {activeTab === 'transcript' && (
                  <div className="transcript-tab-container">
                    <div className="transcript-scroll-area">
                      {activeTranscript?.segments?.map((seg) => (
                        <div 
                          key={seg.id} 
                          id={`segment-${seg.id}`}
                          className={`transcript-segment-row ${
                            activeSegmentId === seg.id ? 'playing-active' : ''
                          } ${
                            highlightedSegmentId === seg.id ? 'rag-highlighted' : ''
                          }`}
                          onClick={() => seekTo(seg.start, seg.id)}
                        >
                          <div className="segment-metadata">
                            <span className="segment-speaker">{seg.speaker}</span>
                            <span className="segment-timestamp">
                              {Math.floor(seg.start / 60)}:
                              {String(Math.floor(seg.start % 60)).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="segment-text">{seg.text}</div>
                        </div>
                      ))}
                    </div>

                    {/* Audio Player — lives inside transcript container, above action dock */}
                    <div className="player-dock glass">
                      <button className="btn-circle btn-play-pause" onClick={playPauseAudio}>
                        {isPlaying ? <Pause className="icon-large" /> : <Play className="icon-large" />}
                      </button>
                      <div className="timeline-scrubber-wrapper">
                        <span className="time-lbl">
                          {Math.floor(currentTime / 60)}:
                          {String(Math.floor(currentTime % 60)).padStart(2, '0')}
                        </span>
                        <input 
                          type="range" 
                          min={0}
                          max={selectedTranscript.duration}
                          value={currentTime}
                          onChange={(e) => seekTo(parseFloat(e.target.value))}
                          className="scrubber-bar"
                        />
                        <span className="time-lbl">
                          {Math.floor(selectedTranscript.duration / 60)}:
                          {String(Math.floor(selectedTranscript.duration % 60)).padStart(2, '0')}
                        </span>
                      </div>
                      <audio 
                        ref={audioRef}
                        src={audioUrl || ""}
                        onTimeUpdate={handleAudioTimeUpdate}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Insights Tab with Collapsible RAG Citations */}
                {activeTab === 'insights' && (
                  <div className="insights-tab-container">
                    
                    {/* Left Pane: Pain Points / Key Challenges */}
                    <div className="insights-panel glass">
                      <div className="panel-header">
                        <h2>{insights?.mode === 'research' ? '🔴 Key Challenges & Themes' : '🔴 Extracted Pain Points'}</h2>
                        <span className="count">
                          {(insights?.pain_points || []).length} {insights?.mode === 'research' ? 'identified' : 'found'}
                        </span>
                      </div>
                      <div className="panel-scroll">
                        {(!insights?.pain_points || insights.pain_points.length === 0) ? (
                          <div className="no-data">
                            {insights?.mode === 'research' ? 'No key challenges identified.' : 'No pain points identified in context.'}
                          </div>
                        ) : (
                          insights.pain_points.map((pp) => (
                            <div key={pp.id} className="insight-card">
                              <div className="card-header">
                                <label className="check-label">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedPainPoints.some(p => p.id === pp.id)}
                                    onChange={() => togglePainSelect(pp)}
                                    className="custom-checkbox"
                                  />
                                  <h3>{pp.title}</h3>
                                </label>
                                <span className={`severity-badge ${(pp.severity || 'Medium').toLowerCase()}`}>
                                  {pp.severity || 'Medium'}
                                </span>
                              </div>
                              <p className="description">{pp.description}</p>
                              
                              <div className="citations-block">
                                <h4 className="cit-title">Grounded Evidence Excerpts:</h4>
                                {(pp.citations || []).map((cit, idx) => (
                                  <div 
                                    key={idx} 
                                    className="citation-bubble"
                                    onClick={() => jumpToCitation(cit.segment_id, parseFloat(cit.timestamp))}
                                  >
                                    <p className="quote">"{cit.quote}"</p>
                                    <div className="cit-meta">
                                      <span>{cit.speaker}</span>
                                      <span className="link-text">
                                        <ExternalLink className="icon-tiny" /> segment {cit.segment_id} ({cit.timestamp})
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right Pane: Proposed Feature Roadmap / Actionable Recommendations */}
                    <div className="insights-panel glass">
                      <div className="panel-header">
                        <h2>{insights?.mode === 'research' ? '✨ Actionable Recommendations' : '✨ Proposed Features'}</h2>
                        <span className="count">
                          {(insights?.features || []).length} {insights?.mode === 'research' ? 'recommendations' : 'suggested'}
                        </span>
                      </div>
                      <div className="panel-scroll">
                        {(!insights?.features || insights.features.length === 0) ? (
                          <div className="no-data">
                            {insights?.mode === 'research' ? 'No recommendations identified.' : 'No feature suggestions identified.'}
                          </div>
                        ) : (
                          insights.features.map((feat) => (
                            <div key={feat.id} className="insight-card">
                              <div className="card-header">
                                <label className="check-label">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedFeatures.some(f => f.id === feat.id)}
                                    onChange={() => toggleFeatureSelect(feat)}
                                    className="custom-checkbox"
                                  />
                                  <h3>{feat.title}</h3>
                                </label>
                                <span className="moscow-badge">{feat.moscow || 'Must-have'}</span>
                              </div>
                              <p className="description">{feat.description}</p>

                              {/* Backlog Scoring Summary Preview */}
                              <div className="metrics-summary">
                                <div>Reach: <strong>{feat.rice?.reach || 0}</strong></div>
                                <div>Impact: <strong>{feat.rice?.impact || 0}</strong></div>
                                <div>Confidence: <strong>{Math.round((feat.rice?.confidence || 0) * 100)}%</strong></div>
                                <div>Effort: <strong>{feat.rice?.effort || 1}</strong></div>
                                <div className="rice-score-highlight">RICE: <strong>{feat.rice?.score || 0}</strong></div>
                              </div>

                              <div className="citations-block">
                                <h4 className="cit-title">Grounded Evidence Excerpts:</h4>
                                {(feat.citations || []).map((cit, idx) => (
                                  <div 
                                    key={idx} 
                                    className="citation-bubble"
                                    onClick={() => jumpToCitation(cit.segment_id, parseFloat(cit.timestamp))}
                                  >
                                    <p className="quote">"{cit.quote}"</p>
                                    <div className="cit-meta">
                                      <span>{cit.speaker}</span>
                                      <span className="link-text">
                                        <ExternalLink className="icon-tiny" /> segment {cit.segment_id} ({cit.timestamp})
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. RICE Backlog Grid Spread Tab */}
                {activeTab === 'backlog' && (
                  <div className="backlog-tab-container glass">
                    <div className="backlog-header">
                      <div>
                        <h2>{insights.mode === 'research' ? 'Prioritized Action Plan Backlog' : 'Interactive Roadmap Prioritization Backlog'}</h2>
                        <p className="desc">
                          {insights.mode === 'research' 
                            ? 'Evaluate and fine-tune strategic recommendation scores. The priority score dynamically updates.'
                            : 'Fine-tune confidence and complexity scores directly in the cells. The RICE score dynamically updates.'}
                        </p>
                      </div>
                      <div className="actions">
                        <button className="btn btn-secondary" onClick={exportToCSV}>
                          <Download className="icon-medium" /> Export CSV
                        </button>
                      </div>
                    </div>

                    <div className="table-scroll">
                      <table className="backlog-table">
                        <thead>
                          <tr>
                            <th width="40">Select</th>
                            <th>{insights.mode === 'research' ? 'Recommendation Details' : 'Feature Details'}</th>
                            <th width="120">MoSCoW</th>
                            <th width="110" className="text-center">
                              {insights.mode === 'research' ? 'Importance (1-10)' : 'Reach (1-10)'}
                            </th>
                            <th width="110" className="text-center">Impact (0.25-3)</th>
                            <th width="110" className="text-center">
                              {insights.mode === 'research' ? 'Evidence (10-100%)' : 'Confidence (10-100%)'}
                            </th>
                            <th width="110" className="text-center">
                              {insights.mode === 'research' ? 'Difficulty (1-5)' : 'Effort (1-5)'}
                            </th>
                            <th width="100" className="text-center">
                              {insights.mode === 'research' ? 'Priority Score' : 'RICE Score'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(insights?.features || []).map((feat) => {
                            const isSelected = selectedFeatures.some(f => f.id === feat.id);
                            return (
                              <tr key={feat.id} className={isSelected ? 'selected-row' : ''}>
                                <td className="text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleFeatureSelect(feat)}
                                  />
                                </td>
                                <td>
                                  <div className="table-feat-title">{feat.title}</div>
                                  <div className="table-feat-desc">{feat.description}</div>
                                </td>
                                <td>
                                  <button 
                                    onClick={() => cycleMoscow(feat.id)}
                                    className={`moscow-tag-btn ${(feat.moscow || 'Must-have').toLowerCase().replace('-', '')}`}
                                  >
                                    {feat.moscow || 'Must-have'}
                                  </button>
                                </td>
                                {/* Reach */}
                                <td>
                                  <div className="metric-adjuster">
                                    <button onClick={() => updateRiceValue(feat.id, 'reach', -1)}><Minus className="icon-tiny"/></button>
                                    <span>{feat.rice?.reach || 0}</span>
                                    <button onClick={() => updateRiceValue(feat.id, 'reach', 1)}><Plus className="icon-tiny"/></button>
                                  </div>
                                </td>
                                {/* Impact */}
                                <td>
                                  <div className="metric-adjuster">
                                    <button onClick={() => updateRiceValue(feat.id, 'impact', -0.25)}><Minus className="icon-tiny"/></button>
                                    <span>{feat.rice?.impact || 0}</span>
                                    <button onClick={() => updateRiceValue(feat.id, 'impact', 0.25)}><Plus className="icon-tiny"/></button>
                                  </div>
                                </td>
                                {/* Confidence */}
                                <td>
                                  <div className="metric-adjuster">
                                    <button onClick={() => updateRiceValue(feat.id, 'confidence', -0.1)}><Minus className="icon-tiny"/></button>
                                    <span>{Math.round((feat.rice?.confidence || 0) * 100)}%</span>
                                    <button onClick={() => updateRiceValue(feat.id, 'confidence', 0.1)}><Plus className="icon-tiny"/></button>
                                  </div>
                                </td>
                                {/* Effort */}
                                <td>
                                  <div className="metric-adjuster">
                                    <button onClick={() => updateRiceValue(feat.id, 'effort', -1)}><Minus className="icon-tiny"/></button>
                                    <span>{feat.rice?.effort || 1}</span>
                                    <button onClick={() => updateRiceValue(feat.id, 'effort', 1)}><Plus className="icon-tiny"/></button>
                                  </div>
                                </td>
                                <td className="text-center font-bold text-indigo">
                                  {feat.rice?.score || 0}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. PRD Rendered Viewer */}
                {activeTab === 'prd' && (
                  <div className="prd-tab-container glass">
                    <div className="prd-header">
                      <div>
                        <h2>
                          {insights.mode === 'research' 
                            ? 'Generated Executive Strategy Brief' 
                            : 'Generated PRD Draft'}
                        </h2>
                        <p className="desc">
                          {insights.mode === 'research'
                            ? 'Grounded in selected challenges and strategic recommendations.'
                            : 'Grounded in selected pain points and prioritized backlog features.'}
                        </p>
                      </div>
                      <div className="actions">
                        <button className="btn btn-secondary" onClick={copyPrdToClipboard}>
                          <Copy className="icon-medium" /> Copy
                        </button>
                        <button className="btn btn-secondary" onClick={downloadPrdMarkdown}>
                          <Download className="icon-medium" /> Download MD
                        </button>
                      </div>
                    </div>
                    
                    {/* Rendered markdown view instead of raw textarea */}
                    <div className="prd-rendered">
                      {prd.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        // Render headings
                        if (trimmed.startsWith('### ')) {
                          return <h4 key={i} className="prd-h3">{trimmed.slice(4).replace(/\*\*(.*?)\*\*/g, '$1')}</h4>;
                        }
                        if (trimmed.startsWith('## ')) {
                          return <h3 key={i} className="prd-h2">{trimmed.slice(3).replace(/\*\*(.*?)\*\*/g, '$1')}</h3>;
                        }
                        if (trimmed.startsWith('# ')) {
                          return <h2 key={i} className="prd-h1">{trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</h2>;
                        }
                        // Render bullet points
                        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                          const content = trimmed.slice(2);
                          return (
                            <li key={i} className="prd-li" dangerouslySetInnerHTML={{
                              __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }} />
                          );
                        }
                        // Horizontal rule
                        if (trimmed === '---') return <hr key={i} className="prd-hr" />;
                        // Blank line = spacer
                        if (!trimmed) return <div key={i} className="prd-spacer" />;
                        // Regular paragraph with **bold** support
                        return (
                          <p key={i} className="prd-p" dangerouslySetInnerHTML={{
                            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }} />
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
              
              {/* Sticky bottom Action Dock — only show when insights exist AND not on PRD tab */}
              {(selectedFeatures.length > 0 || selectedPainPoints.length > 0) && activeTab !== 'prd' && (
                <div className="action-dock glass">
                  <div className="selection-count">
                    <CheckCircle className="icon-medium text-pink" />
                    <span>
                      {insights.mode === 'research' ? (
                        <>
                          <strong>{selectedPainPoints.length}</strong> challenges · <strong>{selectedFeatures.length}</strong> recommendations
                        </>
                      ) : (
                        <>
                          <strong>{selectedPainPoints.length}</strong> pain points · <strong>{selectedFeatures.length}</strong> features
                        </>
                      )}
                    </span>
                  </div>
                  <button 
                    className="btn btn-primary btn-dock-cta"
                    onClick={prd ? () => setActiveTab('prd') : generatePRD}
                    disabled={isPrdLoading}
                  >
                    {isPrdLoading ? (
                      <>
                        <RefreshCw className="icon-medium animate-spin" />
                        Drafting...
                      </>
                    ) : prd ? (
                      <>
                        <BookOpen className="icon-medium" />
                        View PRD Draft
                      </>
                    ) : (
                      <>
                        <Sparkles className="icon-medium text-amber" />
                        {insights.mode === 'research' ? 'Draft Brief' : 'Draft PRD'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state glass">


              <h2>Echo Roadmap Workspace</h2>
              <p className="lead-text">Upload a user-interview recording to isolate customer friction, extract cited pain points, and prioritise your backlog based on quantitative RICE score analysis.</p>
              
              <div className="features-grid">
                <div className="feat-col">
                  <h4>🎙️ Whisper ASR</h4>
                  <p>Speech to text with accurate segment timings.</p>
                </div>
                <div className="feat-col">
                  <h4>🧠 Citation RAG</h4>
                  <p>Grounded quotes matching back to transcript source blocks.</p>
                </div>
                <div className="feat-col">
                  <h4>📊 Prioritized Backlog</h4>
                  <p>RICE & MoSCoW backlogs and direct markdown PRD drafting.</p>
                </div>
              </div>

              <div className="empty-state-cta">
                <a 
                  href={`${API_BASE}/api/extension/download`} 
                  className="btn btn-secondary btn-extension-hero"
                  download
                >
                  <Cpu className="icon-medium" /> Get Chrome Extension
                </a>
                <p className="cta-note">Record live Google Meet & Zoom meetings natively in Chrome.</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
