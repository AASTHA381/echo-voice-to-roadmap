# Product Requirement Document (PRD)

## Product Name: Echo - Voice-to-Roadmap AI Copilot
* **Author**: Aastha Saini (Lead PM & Developer)
* **Status**: Completed / Released (V1.0)
* **Date**: August 2026
* **Target Release**: Q3 2026
* **Live App**: [Vercel Deployment](https://echo-voice-to-roadmap-aastha381.vercel.app/)

---

## 1. Executive Summary & Value Proposition
Product Managers (PMs) and UX Researchers conduct qualitative user interviews but face significant friction in translating hours of raw conversation into prioritized roadmap features and technical specifications. This synthesis is traditionally manual, prone to subjective bias, and time-consuming.

**Echo** is an AI-powered PM copilot that automates this entire lifecycle. Echo transcribes raw audio, automatically classifies the context of the conversation, extracts key pain points and recommendations, prioritizes them using interactive framework spreadsheets (RICE or Research Priority), supports transcript-grounded follow-up questions, visualizes speaker and topic dynamics, and drafts full Markdown Product Requirement Documents (PRDs) or Executive Memos.

Crucially, **every extracted feature or insight is linked to a verified, timestamped quote** from the source audio recording. Clicking a quote citation instantly jumps the player's timeline to the exact second the statement was spoken, guaranteeing stakeholder trust and eliminating roadmap hallucinations.

---

## 2. Problem Statement & User Personas
### 2.1. The Problems
1. **The Synthesis Bottleneck**: Transcribing and manually tagging a 1-hour interview takes 3-4 hours of manual labor.
2. **Roadmap Subjectivity**: Roadmap prioritization often suffers from the "Loudest Voice" bias rather than being driven by objective, evidence-backed scores.
3. **The Stakeholder Credibility Gap**: When presenting roadmap choices, PMs are often challenged to prove that *actual* users requested a feature. Linking feature requests to the exact voice recordings manually is tedious.
4. **Context Collapse**: General research/expert interviews are forced into standard software engineering ticket formats, which doesn't fit qualitative strategic analysis.

### 2.2. Target Audience & Personas
* **Sarah (The Growth Product Manager)**: Needs to synthesize weekly usability test sessions for the checkout flow and compile clean requirements for developers. She needs a tool that spits out standard software-focused roadmaps and engineering-ready PRDs.
* **David (The Senior UX Researcher / Strategist)**: Conducts open-ended industry expert interviews or customer discovery calls. He needs to extract themes, challenges, and high-level recommendations, and output a strategic Executive Memo rather than technical specifications.

---

## 3. System Architecture & Tech Stack
To ensure maximum responsiveness and local data privacy:
* **Frontend**: React (built with Vite), styled using custom Vanilla CSS variables implementing a premium **Warm-Stone Light Theme** with **Amethyst Violet** accents.
* **Audio Layer**: Native HTML5 `<audio>` player persistently mounted in the DOM to prevent playback state resets during tab switches, combined with custom FastAPI Range-Request streaming to support smooth timeline seeking.
* **Backend**: FastAPI (Python 3.13) for fast asynchronous processing.
* **Transcription (ASR)**: Groq SDK hosting Whisper-Large-v3 for near-instant transcription.
* **Semantic Analysis (RAG)**:
  * Local vector embeddings calculated via `SentenceTransformers (all-MiniLM-L6-v2)`.
  * Cosine similarity matching in backend Numpy space.
  * Context generation processed by OpenAI GPT-OSS 120B via Groq.
* **Factual Verification Guardrail**: A backend security layer that programmatically matches LLM-generated quotes word-for-word against the source transcript database before returning results to the client, preventing hallucinated quotes.
* **PWA & Chrome Extension Integration**: Manifest v3 integration for recording live Google Meet/Zoom browser tabs, and standard service workers for local PWA desktop installs.
* **Collaboration Prototype**: Browser-local workspace invitations, comments, presence simulation, and audit activity used to validate the collaboration experience before adding authentication and real-time infrastructure.

---

## 4. Detailed Functional Requirements

### 4.1. Core Module 1: Persistent Audio Player & Interactive Transcript
* **REQ-1**: Accept audio file uploads (MP3, WAV, WEBM, M4A, OGG) up to 25MB.
* **REQ-2**: Transcribe audio via Groq Whisper-Large-v3 with word-level timestamps and speaker label clustering.
* **REQ-3**: Provide a persistent bottom player dock that remains active and playing even when the user switches tabs (Transcript, Insights, Backlog, PRD).
* **REQ-4**: Sync the highlighted transcript segment with the audio player's current playback position in real-time.
* **REQ-5**: Clicking on any transcript line or timestamp seeks the audio player to that exact second.

### 4.2. Core Module 2: Context-Aware Dual Layouts
* **REQ-6**: Automatically classify the uploaded file context:
  * **Software Feedback Mode**: Tailored for usability testing, SaaS feature feedback, and application testing.
  * **General Research Mode**: Tailored for market research, interviews, webinars, and open discussions.
* **REQ-7**: Dynamically adapt the UI:
  * **Software Mode UI**: Displays "Extracted Pain Points" and "Proposed Features".
  * **Research Mode UI**: Displays "Key Challenges & Themes" and "Actionable Recommendations".

### 4.3. Core Module 3: Zero-Hallucination Citations (RAG)
* **REQ-8**: Extract pain points and features/recommendations using LLM synthesis with context-injected transcript segments.
* **REQ-9**: Every extracted card must render a clickable Citation Badge showing: `Speaker Name · Timestamp · Exact Quote`.
* **REQ-10**: Clicking the Citation Badge switches the main tab view back to the transcript, scrolls to the referenced text block, highlights it, and triggers the audio player to seek and play.
* **REQ-11**: Enforce verification check: if the LLM produces a citation quote that cannot be found exactly in the transcript text, filter it out or flag it to avoid hallucination.

### 4.4. Core Module 4: Interactive Prioritization Backlog
* **REQ-12**: Display all extracted features/recommendations in an editable spreadsheet-style grid.
* **REQ-13**: Implement formulas for live score calculation:
  * **Software RICE Score**:
    $$\text{RICE} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$
  * **Research Priority Score**:
    $$\text{Priority} = \frac{\text{Importance} \times \text{Impact} \times \text{Evidence}}{\text{Difficulty}}$$
* **REQ-14**: Cells must support instant double-click/single-click value changes (Reach, Impact, Confidence, Effort, Difficulty, Importance, Evidence) with automatic recalculation of priority scores.
* **REQ-15**: Support MoSCoW prioritization tagging (Must Have, Should Have, Could Have, Won't Have).
* **REQ-16**: Provide a "Download CSV" feature to export the prioritized backlog.

### 4.5. Core Module 5: Strategic Document Generator
* **REQ-17**: Allow the user to check/uncheck specific backlog items to include or exclude them from the document scope.
* **REQ-18**: Render documents based on active mode:
  * **Software Mode**: Generates a standard Product Requirement Document (PRD) detailing User Stories, Requirements, Metric Specs, and Scope.
  * **Research Mode**: Generates an Executive Strategy Memo describing themes, key metrics, findings, and strategic suggestions.
* **REQ-19**: Automatically inline transcript citation quotes inside the document sections for evidence-grounded drafting.
* **REQ-20**: Export generated documents to:
  * **Markdown File (.md)**
  * **PowerPoint Presentation (.pptx)** via Python backend slide template generation.
  * **Copy to Clipboard**

### 4.6. Core Module 6: AI Chat Copilot
* **REQ-21**: Integrated chat sidebar with suggested query prompts (e.g., "Summarize the key takeaway", "Identify the biggest user complaint").
* **REQ-22**: Send the active transcript and prior chat messages to the model so follow-up questions retain meeting-specific context.
* **REQ-23**: Instruct the model to answer only from transcript evidence and state clearly when requested information was not discussed.
* **REQ-24**: Render structured Markdown responses and preserve the analysis workspace through a collapsible sidebar.

### 4.7. Core Module 7: Speaker & Topic Analytics
* **REQ-25**: Calculate talk time, speaking percentage, word count, words per minute, and recurring keywords for every detected speaker.
* **REQ-26**: Allow a user to select a speaker and filter the transcript to that participant's segments.
* **REQ-27**: Generate a chronological topic map containing topic labels, summaries, keywords, and start/end timestamps.
* **REQ-28**: Clicking a topic timeline segment or card must seek the audio player to the topic's start time.

### 4.8. Core Module 8: Workspace Collaboration Prototype
* **REQ-29**: Provide a workspace interface for entering collaborator invitations and showing participant status.
* **REQ-30**: Support local transcript comments and an engagement audit trail for invite, join, view, and comment activity.
* **REQ-31**: Clearly treat presence and invitation behavior as simulated prototype behavior until authenticated email delivery and real-time multi-user synchronization are implemented.

---

## 5. Non-Functional Requirements (NFRs)
* **Performance**:
  * Transcription processing must complete within `< 15 seconds` for standard 5-minute clips.
  * RAG vector computation and analysis must take `< 5 seconds`.
* **Security & Local Processing**:
  * Audio storage and semantic vector indexing must run locally on the backend cache without sharing data with public third-party vector databases.
  * Chat responses must be scoped to the selected transcript and must not claim knowledge outside that source.
  * Prototype collaboration data remains local and must not be represented as authenticated or synchronized user activity.
* **Reliability**:
  * Custom Range-Request responses must enable scrub/seek functionality on all major desktop browsers (Chrome, Safari, Firefox, Edge) without triggering audio stalling or resetting.

---

## 6. Success Metrics & KPIs
* **Roadmap Efficiency (Primary KPI)**: Reduce the time PMs spend analyzing user interviews and generating prioritized backlogs from an average of **4 hours to under 2 minutes**.
* **Citation Click-Through Rate**: Measuring user clicks on citation chips to verify transcript sources (ensuring user trust).
* **Actionable Export Rate**: Percentage of processed interviews that result in a downloaded CSV backlog, Markdown PRD, or PowerPoint slide deck.
* **Copilot Engagement Rate**: Percentage of processed interviews with at least one transcript-grounded follow-up question.
* **Insight-to-Evidence Time**: Median time from opening speaker/topic analytics to seeking the supporting audio segment.
