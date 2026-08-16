import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, FileText, PieChart, BookOpen, Download, 
  Play, Pause, Plus, Minus, Check, CheckCircle, 
  ExternalLink, AlertTriangle, FileSpreadsheet, Sparkles, 
  RefreshCw, Music, Copy, Trash2, Mic, Cpu, ListChecks
} from 'lucide-react';

export default function App() {
  const API_BASE = import.meta.env.VITE_API_URL || '';

  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState('transcript'); // transcript | insights | backlog | prd
  
  // API Config / Environment States
  const [isDemoMode, setIsDemoMode] = useState(true);

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

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("⚠️ File exceeds 25MB limit. Please compress your audio or upload in smaller clips.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setIsUploading(false);
        refreshTranscriptsList();
        setSelectedId(data.id);
      })
      .catch(err => {
        setIsUploading(false);
        alert("Upload failed. Error: " + err.message);
      });
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
  const runRAGAnalysis = () => {
    if (!selectedId) return;
    setIsAnalyzing(true);
    fetch(`${API_BASE}/api/analyze/${selectedId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setIsAnalyzing(false);
        setInsights(data);
        // Pre-select all features and pain points by default
        setSelectedPainPoints(data.pain_points || []);
        setSelectedFeatures(data.features || []);
        setActiveTab('insights');
      })
      .catch(err => {
        setIsAnalyzing(false);
        alert("Analysis failed: " + err.message);
      });
  };

  // Dynamic PRD/Research Brief Generation
  const generatePRD = () => {
    if (!selectedId) return;
    setIsPrdLoading(true);
    fetch(`${API_BASE}/api/prd/${selectedId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selected_features: selectedFeatures,
        selected_pain_points: selectedPainPoints,
        mode: insights.mode || 'software'
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsPrdLoading(false);
        setPrd(data.prd);
        setActiveTab('prd');
      })
      .catch(err => {
        setIsPrdLoading(false);
        alert("Document generation failed: " + err.message);
      });
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

          <label className="btn btn-primary btn-upload">
            <UploadCloud className="icon-medium" />
            Upload Interview
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </header>

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
                    Extracting Insights...
                  </>
                ) : (
                  <>
                    <Sparkles className="icon-medium text-pink" />
                    Analyze with RAG
                  </>
                )}
              </button>
            </div>
          )}
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
                  <FileText className="icon-small" /> Transcript View
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                  disabled={!insights.features?.length}
                  onClick={() => setActiveTab('insights')}
                >
                  <Sparkles className="icon-small" /> {insights.mode === 'research' ? 'Key Themes & Citations' : 'Grounded Insights'}
                  {insights.features?.length > 0 && (
                    <span className="indicator-dot"></span>
                  )}
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'backlog' ? 'active' : ''}`}
                  disabled={!insights.features?.length}
                  onClick={() => setActiveTab('backlog')}
                >
                  <PieChart className="icon-small" /> {insights.mode === 'research' ? 'Recommendations Backlog' : 'RICE Roadmap Backlog'}
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'prd' ? 'active' : ''}`}
                  disabled={!prd}
                  onClick={() => setActiveTab('prd')}
                >
                  <BookOpen className="icon-small" /> {insights.mode === 'research' ? 'Executive Strategy Brief' : 'PRD Draft'}
                </button>
              </nav>

              {/* Tab Content Rendering */}
              <div className={`tab-viewport ${(selectedFeatures.length > 0 || selectedPainPoints.length > 0) ? 'has-action-dock' : ''}`}>
                
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

                    {/* Interactive Player Controls */}
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
                      
                      {/* Hidden dummy HTML5 Audio player so we have local sync triggers */}
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
                        <h2>{insights.mode === 'research' ? '🔴 Key Challenges & Themes' : '🔴 Extracted Pain Points'}</h2>
                        <span className="count">
                          {insights.pain_points.length} {insights.mode === 'research' ? 'identified' : 'found'}
                        </span>
                      </div>
                      <div className="panel-scroll">
                        {insights.pain_points.length === 0 ? (
                          <div className="no-data">
                            {insights.mode === 'research' ? 'No key challenges identified.' : 'No pain points identified in context.'}
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
                                <span className={`severity-badge ${pp.severity.toLowerCase()}`}>
                                  {pp.severity}
                                </span>
                              </div>
                              <p className="description">{pp.description}</p>
                              
                              <div className="citations-block">
                                <h4 className="cit-title">Grounded Evidence Excerpts:</h4>
                                {pp.citations.map((cit, idx) => (
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
                        <h2>{insights.mode === 'research' ? '✨ Actionable Recommendations' : '✨ Proposed Features'}</h2>
                        <span className="count">
                          {insights.features.length} {insights.mode === 'research' ? 'recommendations' : 'suggested'}
                        </span>
                      </div>
                      <div className="panel-scroll">
                        {insights.features.length === 0 ? (
                          <div className="no-data">
                            {insights.mode === 'research' ? 'No recommendations identified.' : 'No feature suggestions identified.'}
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
                                <span className="moscow-badge">{feat.moscow}</span>
                              </div>
                              <p className="description">{feat.description}</p>

                              {/* Backlog Scoring Summary Preview */}
                              <div className="metrics-summary">
                                <div>Reach: <strong>{feat.rice.reach}</strong></div>
                                <div>Impact: <strong>{feat.rice.impact}</strong></div>
                                <div>Confidence: <strong>{feat.rice.confidence * 100}%</strong></div>
                                <div>Effort: <strong>{feat.rice.effort}</strong></div>
                                <div className="rice-score-highlight">RICE: <strong>{feat.rice.score}</strong></div>
                              </div>

                              <div className="citations-block">
                                <h4 className="cit-title">Grounded Evidence Excerpts:</h4>
                                {feat.citations.map((cit, idx) => (
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
                          {insights.features.map((feat) => {
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
                                    className={`moscow-tag-btn ${feat.moscow.toLowerCase().replace('-', '')}`}
                                  >
                                    {feat.moscow}
                                  </button>
                                </td>
                                {/* Reach */}
                                <td>
                                  <div className="metric-adjuster">
                                    <button onClick={() => updateRiceValue(feat.id, 'reach', -1)}><Minus className="icon-tiny"/></button>
                                    <span>{feat.rice.reach}</span>
                                    <button onClick={() => updateRiceValue(feat.id, 'reach', 1)}><Plus className="icon-tiny"/></button>
                                  </div>
                                </td>
                                {/* Impact */}
                                <td>
                                  <div className="metric-adjuster">
                                    <button onClick={() => updateRiceValue(feat.id, 'impact', -0.25)}><Minus className="icon-tiny"/></button>
                                    <span>{feat.rice.impact}</span>
                                    <button onClick={() => updateRiceValue(feat.id, 'impact', 0.25)}><Plus className="icon-tiny"/></button>
                                  </div>
                                </td>
                                {/* Confidence */}
                                <td>
                                  <div className="metric-adjuster">
                                    <button onClick={() => updateRiceValue(feat.id, 'confidence', -0.1)}><Minus className="icon-tiny"/></button>
                                    <span>{Math.round(feat.rice.confidence * 100)}%</span>
                                    <button onClick={() => updateRiceValue(feat.id, 'confidence', 0.1)}><Plus className="icon-tiny"/></button>
                                  </div>
                                </td>
                                {/* Effort */}
                                <td>
                                  <div className="metric-adjuster">
                                    <button onClick={() => updateRiceValue(feat.id, 'effort', -1)}><Minus className="icon-tiny"/></button>
                                    <span>{feat.rice.effort}</span>
                                    <button onClick={() => updateRiceValue(feat.id, 'effort', 1)}><Plus className="icon-tiny"/></button>
                                  </div>
                                </td>
                                <td className="text-center font-bold text-indigo">
                                  {feat.rice.score}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. PRD Markdown editor */}
                {activeTab === 'prd' && (
                  <div className="prd-tab-container glass">
                    <div className="prd-header">
                      <div>
                        <h2>
                          {insights.mode === 'research' 
                            ? 'Generated Executive Strategy Brief' 
                            : 'Generated Product Requirement Document (PRD) Draft'}
                        </h2>
                        <p className="desc">
                          {insights.mode === 'research'
                            ? 'Directly grounded in the selected challenges and prioritized strategic recommendations.'
                            : 'Directly grounded in the selected pain points and prioritized roadmap backlog features.'}
                        </p>
                      </div>
                      <div className="actions">
                        <button className="btn btn-secondary" onClick={copyPrdToClipboard}>
                          <Copy className="icon-medium" /> Copy Code
                        </button>
                        <button className="btn btn-secondary" onClick={downloadPrdMarkdown}>
                          <Download className="icon-medium" /> Download MD
                        </button>
                      </div>
                    </div>
                    
                    <textarea 
                      className="prd-editor" 
                      value={prd} 
                      onChange={(e) => setPrd(e.target.value)}
                      placeholder="Your draft PRD will be loaded here..."
                    />
                  </div>
                )}

              </div>
              
              {/* Sticky bottom Action Dock to generate roadmap / PRD updates */}
              {(selectedFeatures.length > 0 || selectedPainPoints.length > 0) && (
                <div className="action-dock glass animate-slide-up">
                  <div className="selection-count">
                    <CheckCircle className="icon-medium text-pink animate-pulse" />
                    <span>
                      {insights.mode === 'research' ? (
                        <>
                          Selected <strong>{selectedPainPoints.length}</strong> challenges and <strong>{selectedFeatures.length}</strong> recommendations.
                        </>
                      ) : (
                        <>
                          Selected <strong>{selectedPainPoints.length}</strong> pain points and <strong>{selectedFeatures.length}</strong> prioritized features.
                        </>
                      )}
                    </span>
                  </div>
                  <div className="actions-cluster">
                    <button 
                      className="btn btn-primary"
                      onClick={generatePRD}
                      disabled={isPrdLoading}
                    >
                      {isPrdLoading ? (
                        <>
                          <RefreshCw className="icon-medium animate-spin" />
                          {insights.mode === 'research' ? 'Drafting Brief...' : 'Drafting PRD...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="icon-medium text-amber" />
                          {insights.mode === 'research' ? 'Draft Executive Brief' : 'Draft PRD Document'}
                        </>
                      )}
                    </button>
                  </div>
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
                  <h4>📊 prioritised Matrix</h4>
                  <p>RICE & MoSCoW backlogs and direct markdown PRD drafting.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
