import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, FileText, PieChart, BookOpen, Download, 
  Play, Pause, Plus, Minus, Check, CheckCircle, 
  ExternalLink, AlertTriangle, FileSpreadsheet, Sparkles, 
  RefreshCw, Music, Copy, Trash2, Mic, Cpu, Bot, Edit3, ListChecks,
  BarChart2, Share2, Users
} from 'lucide-react';

// Parser to convert MM:SS, HH:MM:SS or ranges into raw seconds for seeking
const parseTimestampToSeconds = (timestampStr) => {
  if (typeof timestampStr === 'number') return timestampStr;
  if (!timestampStr) return 0;
  
  let cleanStr = String(timestampStr).split('-')[0].trim().replace(/s$/, '');
  const parts = cleanStr.split(':');
  
  if (parts.length === 2) {
    const mins = parseFloat(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return mins * 60 + secs;
  } else if (parts.length === 3) {
    const hrs = parseFloat(parts[0]) || 0;
    const mins = parseFloat(parts[1]) || 0;
    const secs = parseFloat(parts[2]) || 0;
    return hrs * 3600 + mins * 60 + secs;
  }
  
  return parseFloat(cleanStr) || 0;
};

const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Robust, clean markdown-to-HTML parser to display Strategy Briefs and PRDs professionally
const renderMarkdown = (mdText) => {
  if (!mdText) return null;
  const lines = mdText.split('\n');
  const elements = [];
  let listItems = [];
  let inList = false;
  let tableRows = [];
  let inTable = false;

  const parseInlineMarkdown = (text) => {
    if (!text || typeof text !== 'string') return '';
    // Replace [text](url) with clickable links
    let html = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');
    
    // Replace [MM:SS] or [HH:MM:SS] with seekable span
    html = html.replace(/\[(\d{1,2}:\d{2}(?::\d{2})?s?)\]/g, (match, p1) => {
      const secs = parseTimestampToSeconds(p1);
      return `<span class="chat-timestamp-seek" data-seconds="${secs}">[${p1}]</span>`;
    });
    // Replace (MM:SS) or (HH:MM:SS) with seekable span
    html = html.replace(/\((\d{1,2}:\d{2}(?::\d{2})?s?)\)/g, (match, p1) => {
      const secs = parseTimestampToSeconds(p1);
      return `<span class="chat-timestamp-seek" data-seconds="${secs}">(${p1})</span>`;
    });

    // Replace **bold** with <strong>bold</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *italic* with <em>italic</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return html;
  };

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="prd-ul">
          {listItems.map((item, idx) => (
            <li key={idx} className="prd-li" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item) }} />
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      // Helper to split row and cleanup empty cells
      const splitRow = (row) => {
        const cells = row.split('|').map(s => s.trim());
        if (cells.length > 0 && cells[0] === '') cells.shift();
        if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
        return cells;
      };

      const headers = splitRow(tableRows[0]);
      let startIndex = 1;
      // Skip markdown separator row if present
      if (tableRows[1] && tableRows[1].replace(/[\s\-|:]/g, '') === '') {
        startIndex = 2;
      }
      
      const bodyRows = tableRows.slice(startIndex).map(row => splitRow(row));

      elements.push(
        <div key={`table-wrapper-${key}`} className="prd-table-wrapper">
          <table className="prd-table">
            <thead>
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(h) }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table detection
    if (inTable) {
      if (!trimmed || trimmed.startsWith('#') || trimmed === '---' || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flushTable(i);
      } else {
        if (trimmed.startsWith('|')) {
          tableRows.push(line);
        } else if (tableRows.length > 0) {
          tableRows[tableRows.length - 1] += '<br/>' + line;
        }
        continue;
      }
    }

    if (trimmed.startsWith('|')) {
      flushList(i);
      inTable = true;
      tableRows.push(line);
      continue;
    }

    // Bullet list detection
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
      continue;
    } else if (inList) {
      if (!trimmed) {
        // Keep list open on empty line
        continue;
      }
      flushList(i);
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={i} className="prd-h1" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(trimmed.slice(2)) }} />);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={i} className="prd-h2" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(trimmed.slice(3)) }} />);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h4 key={i} className="prd-h3" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(trimmed.slice(4)) }} />);
    } else if (trimmed === '---') {
      elements.push(<hr key={i} className="prd-hr" />);
    } else if (!trimmed) {
      elements.push(<div key={i} className="prd-spacer" />);
    } else {
      // Numbered list items
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        const content = numMatch[2];
        elements.push(
          <p key={i} className="prd-p" style={{marginLeft: '16px', textIndent: '-16px'}} dangerouslySetInnerHTML={{
            __html: `<strong>${numMatch[1]}.</strong> ${parseInlineMarkdown(content)}`
          }} />
        );
      } else {
        elements.push(<p key={i} className="prd-p" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }} />);
      }
    }
  }

  // Flush any open lists or tables
  flushList(lines.length);
  flushTable(lines.length);

  return elements;
};

export default function App() {
  const API_BASE = import.meta.env.VITE_API_URL || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : 'https://echo-voice-to-roadmap-pgtn.onrender.com'
  );

  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState('transcript'); // transcript | insights | backlog | prd
  
  // API Config / Environment States
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Transcripts list and selection
  const [transcripts, setTranscripts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTranscript, setActiveTranscript] = useState(null);

  const selectedTranscript = transcripts.find(t => t.id === selectedId);

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
  const [recordingMode, setRecordingMode] = useState('mic'); // mic | meeting
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const activeMicStreamRef = useRef(null);
  const activeDisplayStreamRef = useRef(null);
  const activeAudioCtxRef = useRef(null);

  // Chatbot & Speaker Analytics States
  const [chatMessages, setChatMessages] = useState([]);
  const [chatQuestion, setChatQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedSpeakerFilter, setSelectedSpeakerFilter] = useState(null);
  const [filterSpeaker, setFilterSpeaker] = useState('');
  const [filterType, setFilterType] = useState('all'); // all | questions | statements
  const [filterTimeMin, setFilterTimeMin] = useState('');
  const [filterTimeMax, setFilterTimeMax] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(true);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renamingName, setRenamingName] = useState('');

  // File rename modal state
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFileName, setPendingFileName] = useState('');
  const [serverWaking, setServerWaking] = useState(false); // shows 'server warming' hint during slow calls
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // collapse by default on mobile, toggleable

  // Collaboration & Engagement States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Fetch audit logs from backend
  const fetchAuditLogs = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`${audioBase}/api/workspace/${selectedId}/audit`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    }
  };

  // Generate share link
  const generateShareLink = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`${audioBase}/api/workspace/${selectedId}/share`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.share_url);
      }
    } catch (err) {
      console.error("Failed to generate share link:", err);
    }
  };

  // Log collaboration audit action
  const logAuditAction = async (user, action, details) => {
    if (!selectedId) return;
    try {
      await fetch(`${audioBase}/api/workspace/${selectedId}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, action, details })
      });
      fetchAuditLogs();
    } catch (err) {
      console.error("Failed to log audit action:", err);
    }
  };

  // Sync audit logs and simulate collaborator updates on select
  useEffect(() => {
    if (selectedId) {
      fetchAuditLogs();
      generateShareLink();
      
      // Simulate random collaborator joining after workspace is loaded
      const simulatedCollaborators = ['Sarah (Eng)', 'Alex (UX Designer)', 'Emily (QA)', 'John (Product Owner)'];
      const randomUser = simulatedCollaborators[Math.floor(Math.random() * simulatedCollaborators.length)];
      const actions = [
        { action: 'view_transcript', details: 'Opened the workspace' },
        { action: 'view_insights', details: 'Reviewed Grounded Insights' },
        { action: 'play_audio', details: 'Listened to the recording' }
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      const timer = setTimeout(() => {
        logAuditAction(randomUser, randomAction.action, randomAction.details);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedId]);

  // Auto-collapse left sidebar when chatbot is opened, and expand when closed
  useEffect(() => {
    if (isChatSidebarOpen) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(isMobileDevice);
    }
  }, [isChatSidebarOpen]);

  // Global click delegate to seek audio on clicking any chat/summary timestamp
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const target = e.target.closest('.chat-timestamp-seek');
      if (target) {
        const seconds = parseFloat(target.getAttribute('data-seconds'));
        if (!isNaN(seconds)) {
          // Find if there is a matching segment for this time to set active segment
          let matchingSegId = null;
          if (selectedTranscript && selectedTranscript.segments) {
            const match = selectedTranscript.segments.find(
              seg => seconds >= seg.start && seconds <= seg.end
            );
            if (match) matchingSegId = match.id;
          }
          seekTo(seconds, matchingSegId);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [selectedTranscript, isPlaying]);

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
          setChatMessages([]);
          setSelectedSpeakerFilter(null);
          setIsPlaying(false);
          setCurrentTime(0);
          setIsChatSidebarOpen(!isMobileDevice);
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
    const seconds = parseTimestampToSeconds(startSec);
    setActiveTab('transcript');
    seekTo(seconds, segmentId);
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

  // Calculate speaker statistics dynamically
  const getSpeakerStats = () => {
    if (!activeTranscript || !activeTranscript.segments) return [];
    
    const stats = {};
    let totalDuration = 0;
    
    activeTranscript.segments.forEach(seg => {
      const dur = (seg.end - seg.start) || 0;
      const speaker = seg.speaker || 'Unknown';
      if (!stats[speaker]) {
        stats[speaker] = { duration: 0, count: 0 };
      }
      stats[speaker].duration += dur;
      stats[speaker].count += 1;
      totalDuration += dur;
    });

    if (totalDuration === 0) totalDuration = 1;

    return Object.entries(stats).map(([speaker, val]) => ({
      speaker,
      duration: Math.round(val.duration),
      count: val.count,
      percentage: Math.max(1, Math.round((val.duration / totalDuration) * 100))
    })).sort((a, b) => b.duration - a.duration);
  };

  // Send message to the transcript-grounded chatbot
  const sendChatMessage = async () => {
    if (!chatQuestion.trim() || !selectedId || isChatLoading) return;
    
    const currentQuestion = chatQuestion;
    setChatQuestion('');
    setIsChatLoading(true);
    
    // Append user message immediately
    const newUserMsg = { role: 'user', content: currentQuestion };
    setChatMessages(prev => [...prev, newUserMsg]);
    
    try {
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch(`${API_BASE}/api/chat/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, history })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Chat server returned an error.");
      }
      
      const data = await res.json();
      const newAssistantMsg = { role: 'assistant', content: data.response };
      setChatMessages(prev => [...prev, newAssistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: Could not get a response. ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
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

  // Helper to stop all active hardware streams and close AudioContext safely
  const cleanupRecordingResources = () => {
    if (activeMicStreamRef.current) {
      activeMicStreamRef.current.getTracks().forEach(track => track.stop());
      activeMicStreamRef.current = null;
    }
    if (activeDisplayStreamRef.current) {
      activeDisplayStreamRef.current.getTracks().forEach(track => track.stop());
      activeDisplayStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (activeAudioCtxRef.current) {
      activeAudioCtxRef.current.close().catch(() => {});
      activeAudioCtxRef.current = null;
    }
  };

  // Live Meeting Recording Handlers
  const startRecording = async () => {
    let stream;
    let micStream = null;
    let displayStream = null;
    let audioCtx = null;

    try {
      if (recordingMode === 'meeting') {
        try {
          // 1. Request screen share with system audio
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
        } catch (e) {
          throw new Error("Screen sharing permission denied. Please click 'Record' again, select a tab/screen, and make sure to check the 'Share system audio' box.");
        }

        // Check if displayStream has audio
        if (displayStream.getAudioTracks().length === 0) {
          displayStream.getTracks().forEach(t => t.stop());
          throw new Error("System audio was not shared. Please make sure to check the 'Share system audio' box at the bottom of the screen selection pop-up.");
        }

        try {
          // 2. Request microphone
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
          displayStream.getTracks().forEach(t => t.stop());
          throw new Error("Microphone permission denied. Microphone access is required to record your side of the call.");
        }

        // 3. Mix the streams using Web Audio API
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        const dest = audioCtx.createMediaStreamDestination();

        const micSource = audioCtx.createMediaStreamSource(micStream);
        const displaySource = audioCtx.createMediaStreamSource(displayStream);

        micSource.connect(dest);
        displaySource.connect(dest);

        // Store active streams for dynamic cleanup
        activeMicStreamRef.current = micStream;
        activeDisplayStreamRef.current = displayStream;
        activeAudioCtxRef.current = audioCtx;

        stream = dest.stream;

        // Auto-stop recording if user clicks "Stop Sharing" in browser native controls
        const displayTrack = displayStream.getVideoTracks()[0] || displayStream.getAudioTracks()[0];
        if (displayTrack) {
          displayTrack.onended = () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              stopRecording();
            }
          };
        }
      } else {
        // Standard microphone only
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

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
        // Detect actual mimeType from the recorder
        const actualMimeType = recorder.mimeType || selectedMime || 'audio/mp4';
        
        // Map mimeType to correct file extension
        let extension = 'mp4'; // safe default
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
          cleanupRecordingResources();
          return;
        }

        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const defaultName = recordingMode === 'meeting' 
          ? `Meeting Call (${formattedDate} ${formattedTime})` 
          : `Voice Recording (${formattedDate} ${formattedTime})`;
        const audioFile = new File([audioBlob], `${defaultName}.${extension}`, { type: actualMimeType });
        
        cleanupRecordingResources();
        
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
      cleanupRecordingResources();
      alert("⚠️ Recording failed: " + err.message);
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
      
      cleanupRecordingResources();
      
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

  const handleInlineRenameSave = (transcriptId) => {
    if (!renamingName.trim()) return;
    
    fetch(`${API_BASE}/api/transcripts/${transcriptId}/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_filename: renamingName.trim() })
    })
      .then(res => {
        if (!res.ok) throw new Error("Rename failed");
        return res.json();
      })
      .then(() => {
        // Update local state transcripts list
        setTranscripts(prev => prev.map(t => {
          if (t.id === transcriptId) {
            let cleanName = renamingName.trim();
            // preserve original extension if not typed
            if (!cleanName.includes('.')) {
              const origExt = t.filename.split('.').pop() || 'wav';
              cleanName = `${cleanName}.${origExt}`;
            }
            return { ...t, filename: cleanName };
          }
          return t;
        }));
        // If current active selected item was renamed, update selectedTranscript object
        if (selectedId === transcriptId) {
          setActiveTranscript(prev => {
            if (!prev) return prev;
            let cleanName = renamingName.trim();
            if (!cleanName.includes('.')) {
              const origExt = prev.filename.split('.').pop() || 'wav';
              cleanName = `${cleanName}.${origExt}`;
            }
            return { ...prev, filename: cleanName };
          });
        }
        setRenamingId(null);
      })
      .catch(err => {
        console.error("Error renaming transcript:", err);
        alert("Failed to rename file. Please try again.");
      });
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
            <>
              <a 
                href={audioUrl || '#'}
                download={selectedTranscript.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-download-audio"
                style={{
                  display: audioUrl ? 'flex' : 'none',
                  alignItems: 'center',
                  gap: '6px',
                  marginRight: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                title="Download raw audio recording"
              >
                <Download className="icon-small text-emerald" />
                Download Audio
              </a>
            </>
          )}

          <div className="record-mode-selector">
            <button
              className={`btn-toggle-mode ${recordingMode === 'mic' ? 'active' : ''}`}
              onClick={() => setRecordingMode('mic')}
              disabled={isRecording}
              title="Record standard microphone audio (in-person or solo voice)"
            >
              <Mic style={{ width: '13px', height: '13px' }} />
              Mic Only
            </button>
            {!isMobileDevice && (
              <button
                className={`btn-toggle-mode ${recordingMode === 'meeting' ? 'active' : ''}`}
                onClick={() => setRecordingMode('meeting')}
                disabled={isRecording}
                title="Record meeting call silently (requires Chrome/Edge/Firefox on desktop)"
              >
                <Cpu style={{ width: '13px', height: '13px' }} />
                Meeting Call
              </button>
            )}
          </div>

          <button 
            className="btn btn-secondary btn-record"
            onClick={startRecording}
            disabled={isUploading || isRecording}
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
            
             <h2>{recordingMode === 'meeting' ? 'Recording Meeting Call...' : 'Recording Microphone...'}</h2>
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
             
             <p className="recording-note">
               {recordingMode === 'meeting'
                 ? "💡 Tip: Ensure you checked 'Share system audio' in the screen selection window to record both sides."
                 : "Speak clearly. We will capture and transcribe your microphone audio in the background."}
             </p>
            
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
        <aside className={`sidebar glass ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{cursor: 'pointer'}}>
            <h3>Recent Interviews</h3>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span className="count-badge">{transcripts.length}</span>
              <span className="sidebar-toggle-btn" style={{fontSize: '11.5px', color: 'var(--color-primary)', fontWeight: '700'}}>
                {sidebarCollapsed ? '▼' : '▲'}
              </span>
            </div>
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
                    {renamingId === t.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="text"
                          className="rename-inline-input"
                          value={renamingName}
                          onChange={(e) => setRenamingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleInlineRenameSave(t.id);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: '2px 6px',
                            fontSize: '11.5px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-primary)',
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: '#000000',
                            outline: 'none',
                            fontWeight: '600'
                          }}
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleInlineRenameSave(t.id); }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-purple)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                          title="Save new filename"
                        >
                          <Check className="icon-tiny" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setRenamingId(null); }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', fontSize: '14px', display: 'flex', alignItems: 'center' }}
                          title="Cancel rename"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="filename-container" style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '75%', minWidth: 0 }}>
                          {selectedId === t.id && <Sparkles className="icon-tiny text-pink animate-pulse" />}
                          <span className="filename text-ellipsis" title={t.filename.replace(/\.[^/.]+$/, "")} style={{ fontWeight: selectedId === t.id ? '700' : '500' }}>
                            {t.filename.replace(/\.[^/.]+$/, "")}
                          </span>
                        </div>
                        <div className="card-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            className="rename-card-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingId(t.id);
                              setRenamingName(t.filename);
                            }}
                            title="Rename Clip"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Edit3 className="icon-tiny" />
                          </button>
                          <button 
                            className="delete-card-btn"
                            onClick={(e) => handleDeleteTranscript(t.id, e)}
                            title="Delete Transcript"
                          >
                            <Trash2 className="icon-tiny" />
                          </button>
                        </div>
                      </>
                    )}
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

            {activeTranscript && (
              <div className="sidebar-filters glass" style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'rgba(255, 255, 255, 0.25)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <FileText style={{ width: '13px', height: '13px' }} /> Transcript Filters
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Search Keyword</label>
                  <input 
                    type="text" 
                    placeholder="Type keyword..." 
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '6px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Speaker</label>
                  <select 
                    value={filterSpeaker || selectedSpeakerFilter || ''}
                    onChange={(e) => {
                      setFilterSpeaker(e.target.value);
                      setSelectedSpeakerFilter(e.target.value || null);
                    }}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '6px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="">All Speakers</option>
                    {Array.from(new Set(activeTranscript?.segments?.map(s => s.speaker) || [])).map(sp => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Speech Type</label>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '6px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="all">All Content</option>
                    <option value="questions">❔ Questions Only</option>
                    <option value="statements">💬 Statements Only</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Time Range (Mins)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="number" 
                      placeholder="Min" 
                      min="0"
                      value={filterTimeMin}
                      onChange={(e) => setFilterTimeMin(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12.5px', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '6px', color: 'var(--text-main)', outline: 'none', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>to</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      min="0"
                      value={filterTimeMax}
                      onChange={(e) => setFilterTimeMax(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12.5px', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '6px', color: 'var(--text-main)', outline: 'none', textAlign: 'center' }}
                    />
                  </div>
                </div>

                {(filterKeyword || filterSpeaker || selectedSpeakerFilter || filterType !== 'all' || filterTimeMin || filterTimeMax) && (
                  <button 
                    onClick={() => {
                      setFilterKeyword('');
                      setFilterSpeaker('');
                      setSelectedSpeakerFilter(null);
                      setFilterType('all');
                      setFilterTimeMin('');
                      setFilterTimeMax('');
                    }}
                    style={{ width: '100%', padding: '6px', marginTop: '4px', fontSize: '11.5px', fontWeight: '600', color: 'var(--color-pink)', background: 'transparent', border: '1px dashed var(--color-pink)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    className="btn-clear-hover"
                  >
                    Reset Active Filters
                  </button>
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
        <section className={`content-pane ${(selectedFeatures.length > 0 || selectedPainPoints.length > 0) && activeTab !== 'prd' ? 'has-action-dock' : ''}`}>
          {selectedTranscript ? (
            <>
              {/* Workspace Title & Collaboration Share bar */}
              <div className="workspace-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 2px 0' }}>
                    {selectedTranscript.filename.replace(/\.[^/.]+$/, "")}
                  </h2>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Uploaded {new Date(selectedTranscript.uploaded_at).toLocaleDateString()} · Duration: {Math.floor(selectedTranscript.duration / 60)}m {Math.floor(selectedTranscript.duration % 60)}s
                  </span>
                </div>
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: 'var(--color-primary)', color: '#ffffff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79,70,229,0.1)' }}
                  className="share-btn-hover"
                >
                  <Share2 style={{ width: '14px', height: '14px' }} /> Share Workspace
                </button>
              </div>

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
                  disabled={!insights?.pain_points?.length && !insights?.features?.length}
                  onClick={() => setActiveTab('backlog')}
                >
                  <PieChart className="icon-small" /> Backlog
                  {(insights?.features?.length > 0 || insights?.pain_points?.length > 0) && (
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
                <button 
                  className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart2 className="icon-small" /> Analytics
                </button>
              </nav>

              {/* Tab Content Rendering */}
              <div className="tab-viewport">
                
                {/* 1. Transcript Tab */}
                {activeTab === 'transcript' && (
                  <div className="transcript-tab-container">
                    <div className="transcript-scroll-area">
                      {/* Collapsible Speaker Contribution Stats */}
                      {activeTranscript?.segments?.length > 0 && (
                        <div className="speaker-stats-card glass">
                          <div 
                            className="stats-header" 
                            onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '10px 14px' }}
                          >
                            <h4 style={{ margin: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <PieChart className="icon-small text-purple" /> 
                              Speaker Contribution Stats
                            </h4>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {isStatsCollapsed ? 'Show Details ▼' : 'Hide ▲'}
                            </span>
                          </div>
                          
                          {!isStatsCollapsed && (
                            <div className="stats-body" style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {getSpeakerStats().map((stat, idx) => (
                                <div 
                                  key={idx} 
                                  className={`speaker-stat-row ${selectedSpeakerFilter === stat.speaker ? 'active-filter' : ''}`}
                                  onClick={() => setSelectedSpeakerFilter(selectedSpeakerFilter === stat.speaker ? null : stat.speaker)}
                                  style={{
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    background: selectedSpeakerFilter === stat.speaker ? 'rgba(79, 70, 229, 0.08)' : 'rgba(0,0,0,0.01)',
                                    border: selectedSpeakerFilter === stat.speaker ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid transparent',
                                    transition: 'all 0.2s ease'
                                  }}
                                  title={`Click to filter transcript by ${stat.speaker}`}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                    <strong>{stat.speaker}</strong>
                                    <span style={{ color: 'var(--text-muted)' }}>{stat.percentage}% ({stat.duration}s)</span>
                                  </div>
                                  <div className="progress-bar-bg" style={{ height: '6px', background: 'rgba(0,0,0,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div 
                                      className="progress-bar-fill" 
                                      style={{ 
                                        height: '100%', 
                                        width: `${stat.percentage}%`, 
                                        background: idx === 0 ? 'var(--color-primary)' : idx === 1 ? 'var(--color-purple)' : 'var(--color-pink)',
                                        borderRadius: '3px' 
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                              <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                💡 Click on any speaker card above to filter the transcript by that speaker.
                              </p>
                            </div>
                          )}
                        </div>
                      )}



                      {/* Active Filter Reset Banner */}
                      {selectedSpeakerFilter && (
                        <div className="filter-active-banner" style={{
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '8px 12px', 
                          background: 'rgba(79, 70, 229, 0.06)', 
                          border: '1px solid rgba(79, 70, 229, 0.12)', 
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          color: 'var(--color-primary)',
                          marginBottom: '10px'
                        }}>
                          <span>Showing only segments spoken by <strong>{selectedSpeakerFilter}</strong></span>
                          <button 
                            onClick={() => {
                              setSelectedSpeakerFilter(null);
                              setFilterSpeaker('');
                            }}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--color-pink)',
                              fontWeight: '700',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Reset Filter
                          </button>
                        </div>
                      )}

                      {activeTranscript?.segments
                        ?.filter(seg => {
                          const activeSpeaker = filterSpeaker || selectedSpeakerFilter;
                          if (activeSpeaker && seg.speaker !== activeSpeaker) return false;
                          
                          if (filterType === 'questions') {
                            const isQuestion = seg.text.trim().endsWith('?');
                            if (!isQuestion) return false;
                          } else if (filterType === 'statements') {
                            const isQuestion = seg.text.trim().endsWith('?');
                            if (isQuestion) return false;
                          }
                          
                          if (filterTimeMin) {
                            const minSecs = parseFloat(filterTimeMin) * 60;
                            if (seg.start < minSecs) return false;
                          }
                          if (filterTimeMax) {
                            const maxSecs = parseFloat(filterTimeMax) * 60;
                            if (seg.start > maxSecs) return false;
                          }
                          
                          if (filterKeyword) {
                            const q = filterKeyword.toLowerCase();
                            const matchesText = seg.text.toLowerCase().includes(q);
                            const matchesSpeaker = seg.speaker.toLowerCase().includes(q);
                            if (!matchesText && !matchesSpeaker) return false;
                          }
                          
                          return true;
                        })
                        ?.map((seg) => (
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
                              <span 
                                className="segment-speaker hover-clickable"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSpeakerFilter(selectedSpeakerFilter === seg.speaker ? null : seg.speaker);
                                }}
                                title={`Click to filter by ${seg.speaker}`}
                                style={{
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  textDecorationStyle: 'dotted'
                                }}
                              >
                                {seg.speaker}
                              </span>
                              <span 
                                className="segment-timestamp"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  seekTo(seg.start, seg.id);
                                }}
                              >
                                {Math.floor(seg.start / 60)}:
                                {String(Math.floor(seg.start % 60)).padStart(2, '0')}
                              </span>
                            </div>
                            <div className="segment-text">{seg.text}</div>
                          </div>
                        ))
                      }
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
                                    onClick={() => jumpToCitation(cit.segment_id, cit.timestamp)}
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
                                    onClick={() => jumpToCitation(cit.segment_id, cit.timestamp)}
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
                          {(insights?.features || []).length === 0 ? (
                            <tr>
                              <td colSpan="8" style={{padding: '40px 20px', color: 'var(--text-muted)', textAlign: 'center'}}>
                                <AlertTriangle className="icon-medium" style={{margin: '0 auto 8px', display: 'block', color: 'var(--color-purple)'}} />
                                {insights?.mode === 'research' 
                                  ? 'No strategic recommendations identified to prioritize.' 
                                  : 'No suggested features identified to prioritize.'}
                              </td>
                            </tr>
                          ) : (
                            (insights?.features || []).map((feat) => {
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
                          }))}
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
                    {renderMarkdown(prd)}
                    </div>
                  </div>
                )}

                {/* 5. Speaker & Topic Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div className="analytics-tab-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', padding: '10px 0' }}>
                    
                    {/* Left Pane: Speaker Stats */}
                    <div className="analytics-card glass" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'rgba(255, 255, 255, 0.4)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users className="icon-medium text-purple" /> Speaker Talk-Time & Pace
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(() => {
                          if (!activeTranscript || !activeTranscript.segments) return <div className="no-data">No segments available.</div>;
                          
                          // Calculate statistics
                          const speakerStats = {};
                          let totalSecs = 0;
                          activeTranscript.segments.forEach(seg => {
                            const duration = Math.max(seg.end - seg.start, 1);
                            const wordsCount = seg.text.split(/\s+/).length;
                            if (!speakerStats[seg.speaker]) {
                              speakerStats[seg.speaker] = { talkTime: 0, words: 0 };
                            }
                            speakerStats[seg.speaker].talkTime += duration;
                            speakerStats[seg.speaker].words += wordsCount;
                            totalSecs += duration;
                          });

                          return Object.keys(speakerStats).map((sp, idx) => {
                            const stats = speakerStats[sp];
                            const percentage = totalSecs > 0 ? Math.round((stats.talkTime / totalSecs) * 100) : 0;
                            const talkMins = stats.talkTime / 60;
                            const wpm = talkMins > 0 ? Math.round(stats.words / talkMins) : 0;
                            
                            // Color scheme alternating
                            const colors = ['var(--color-primary)', 'var(--color-purple)', 'var(--color-pink)', 'var(--color-amber)'];
                            const color = colors[idx % colors.length];

                            return (
                              <div key={sp} style={{ padding: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '10px', border: '1px solid rgba(15,23,42,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <strong>{sp}</strong>
                                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 6px', background: 'rgba(15,23,42,0.04)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                                    {percentage}% talk time
                                  </span>
                                </div>
                                
                                <div style={{ height: '6px', background: 'rgba(0,0,0,0.04)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                                  <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: '3px' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                                  <span>Total duration: <strong>{Math.floor(stats.talkTime / 60)}m {Math.floor(stats.talkTime % 60)}s</strong></span>
                                  <span>Pace: <strong style={{ color: wpm > 150 ? 'var(--color-pink)' : 'var(--text-main)' }}>{wpm} WPM</strong></span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Right Pane: Topic Tracker Timeline */}
                    <div className="analytics-card glass" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'rgba(255, 255, 255, 0.4)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart2 className="icon-medium text-pink" /> Chronological Topic Map
                      </h3>
                      
                      <div className="topic-timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {(() => {
                          const topics = insights.topics || [];
                          if (topics.length === 0) {
                            return (
                              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                💡 Analyze this transcript first to extract automatically clustered topics!
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* Horizontal Gantt timeline strip */}
                              <div style={{ display: 'flex', height: '36px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(15,23,42,0.06)', background: 'rgba(15,23,42,0.02)', marginBottom: '10px' }}>
                                {topics.map((t, idx) => {
                                  const totalDuration = activeTranscript?.duration || 1;
                                  const topicDuration = t.end_sec - t.start_sec;
                                  const widthPct = Math.max((topicDuration / totalDuration) * 100, 5); // min 5% width
                                  
                                  const colors = ['#4f46e5', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];
                                  const color = colors[idx % colors.length];

                                  return (
                                    <div 
                                      key={t.id}
                                      onClick={() => seekTo(t.start_sec)}
                                      title={`Click to jump to topic: ${t.label} (${Math.floor(t.start_sec / 60)}m - ${Math.floor(t.end_sec / 60)}m)`}
                                      style={{
                                        width: `${widthPct}%`,
                                        background: color,
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        padding: '0 4px',
                                        borderRight: '1px solid rgba(255,255,255,0.2)'
                                      }}
                                      onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                                    >
                                      {t.label}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Interactive Topic Cards */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                                {topics.map((t, idx) => {
                                  const colors = ['var(--color-primary)', 'var(--color-purple)', 'var(--color-pink)', 'var(--color-amber)', 'var(--color-emerald)'];
                                  const color = colors[idx % colors.length];

                                  return (
                                    <div 
                                      key={t.id}
                                      onClick={() => seekTo(t.start_sec)}
                                      style={{
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.3)',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(15,23,42,0.03)',
                                        borderLeft: `4px solid ${color}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                      }}
                                      className="topic-card-hover"
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>{t.label}</h4>
                                        <span style={{ fontSize: '10.5px', fontWeight: '600', color: color }}>
                                          ⏱️ {Math.floor(t.start_sec / 60)}:{String(Math.floor(t.start_sec % 60)).padStart(2, '0')} - {Math.floor(t.end_sec / 60)}:{String(Math.floor(t.end_sec % 60)).padStart(2, '0')}
                                        </span>
                                      </div>
                                      <p style={{ fontSize: '12px', margin: '0 0 8px 0', color: 'var(--text-muted)', lineHeight: '1.4' }}>{t.summary}</p>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {(t.keywords || []).map(k => (
                                          <span key={k} style={{ fontSize: '9.5px', fontWeight: '600', padding: '1px 5px', background: 'rgba(15,23,42,0.03)', borderRadius: '3px', color: 'var(--text-muted)' }}>
                                            #{k}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}
                      </div>
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
                    onClick={generatePRD}
                    disabled={isPrdLoading || !!prd}
                  >
                    {isPrdLoading ? (
                      <>
                        <RefreshCw className="icon-medium animate-spin" />
                        Drafting...
                      </>
                    ) : prd ? (
                      <>
                        <Check className="icon-medium text-emerald" />
                        {insights.mode === 'research' ? 'Brief Drafted' : 'PRD Drafted'}
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

              {/* Audio Player — lives persistently in content pane bottom */}
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

        {/* Right Sidebar: AI Meeting Copilot Chatbot */}
        {selectedTranscript && (
          <aside className={`chat-sidebar glass ${isChatSidebarOpen ? 'open' : ''}`}>
            <div className="chat-sidebar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot className="icon-medium text-purple" />
                <h3>Meeting Copilot</h3>
              </div>
              <button className="btn-close-chat" onClick={() => setIsChatSidebarOpen(false)}>×</button>
            </div>
            
            <div className="chat-messages-area">
              {chatMessages.length === 0 ? (
                <div className="chat-empty-state">
                  <Bot className="chat-empty-icon animate-pulse" />
                  <h3>Ask your Meeting Copilot</h3>
                  <p>Echo analyzes the meeting transcript to answer questions instantly. Try asking:</p>
                  <div className="chat-suggestions">
                    {(insights?.suggested_questions || [
                      "What were the main customer pain points discussed?",
                      "Summarize the key recommendations or features suggested.",
                      "List any action items or next steps mentioned."
                    ]).map((q, idx) => (
                      <button key={idx} className="suggestion-pill" onClick={() => setChatQuestion(q)}>
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-message-row ${msg.role}`}>
                    <div className="chat-bubble">
                      <div className="sender-lbl">{msg.role === 'user' ? 'You' : 'Echo Copilot'}</div>
                      <div className="message-content">
                        {renderMarkdown(msg.content || '')}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="chat-message-row assistant typing">
                  <div className="chat-bubble animate-pulse">
                    <div className="sender-lbl">Echo Copilot</div>
                    <div className="message-content">
                      <RefreshCw className="icon-small animate-spin text-purple mr-2 inline-block" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-input-dock">
              <input 
                type="text"
                placeholder="Ask about this meeting..."
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }}
                disabled={isChatLoading}
                className="chat-input-field"
              />
              <button 
                onClick={sendChatMessage}
                disabled={isChatLoading || !chatQuestion.trim()}
                className="btn btn-primary btn-chat-send"
              >
                Ask
              </button>
            </div>
          </aside>
        )}
      {/* Floating Chat Trigger Button — only visible when a transcript is active and chat sidebar is closed */}
      {selectedTranscript && !isChatSidebarOpen && (
        <button 
          className="chat-floating-trigger"
          onClick={() => setIsChatSidebarOpen(true)}
          title="Open AI Meeting Copilot"
        >
          <Bot className="icon-medium" />
        </button>
      )}

      {/* 6. Collaboration Share Modal */}
      {isShareModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass" style={{ width: '90%', maxWidth: '500px', padding: '24px', borderRadius: '16px', background: '#ffffff', border: '1px solid var(--border-glass)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} /> Share Discovery Workspace
              </h3>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', fontWeight: '700', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Invite your team members to review transcript evidence, participate in chatbot chats, and align on PRD scopes.
            </p>

            {/* Invite input field */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input 
                type="text" 
                readOnly
                value={shareUrl || `https://echo-voice-to-roadmap-aastha381.vercel.app/?share=${selectedId}`}
                style={{ flex: 1, padding: '10px', fontSize: '12.5px', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl || `https://echo-voice-to-roadmap-aastha381.vercel.app/?share=${selectedId}`);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                style={{ padding: '0 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', background: 'var(--color-purple)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
              >
                {isCopied ? 'Copied! ✓' : 'Copy Link'}
              </button>
            </div>

            {/* Engagement Audit Tracker */}
            <div style={{ borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users style={{ width: '15px', height: '15px', color: 'var(--color-pink)' }} /> Collaborator Access Log
              </h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {auditLogs.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                    No collaborator activity logged yet.
                  </div>
                ) : (
                  auditLogs.map((log, idx) => (
                    <div key={idx} style={{ display: 'flex', padding: '8px', background: 'rgba(15,23,42,0.02)', borderRadius: '6px', fontSize: '11.5px', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: 'var(--text-main)' }}>{log.user}</strong>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>{log.details}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
      </main>
    </div>
  );
}
