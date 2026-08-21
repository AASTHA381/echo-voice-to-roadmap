import json
from typing import Dict, List, Any
from groq import Groq
from backend.config import settings
from backend.services.vector_store import vector_store_service

class AnalyzerService:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY:
            self.client = Groq(api_key=settings.GROQ_API_KEY)

    def analyze_transcript(self, transcript_id: str) -> Dict[str, Any]:
        """
        Retrieves relevant segments, performs RAG analysis using Groq,
        and generates cited pain points/key challenges and features/strategic recommendations.
        """
        if not self.client:
            raise ValueError("Groq API Key is not configured.")

        # 1. Query the vector store for challenges and recommendations to get relevant context chunks
        pain_context_results = vector_store_service.search(transcript_id, "user pain points, frustration, issues, bugs, problems, challenges, travel risk", top_k=8)
        feature_context_results = vector_store_service.search(transcript_id, "feature requests, suggestions, recommendations, solutions, travel safety", top_k=8)

        # Merge and deduplicate context segments
        seen_ids = set()
        context_segments = []
        
        # Combine results from both search vectors
        for res in pain_context_results + feature_context_results:
            seg = res["segment"]
            if seg["id"] not in seen_ids:
                seen_ids.add(seg["id"])
                context_segments.append(seg)
                
        # Sort context segments by timestamp/id so they read chronologically
        context_segments.sort(key=lambda x: x["id"])

        # Format context for the LLM
        formatted_context = ""
        for seg in context_segments:
            formatted_context += f"[Segment ID: {seg['id']} | Time: {seg['start']:.2f}s - {seg['end']:.2f}s | Speaker: {seg['speaker']}]\nText: {seg['text']}\n---\n"

        # 2. Build the System & User prompts with context classification and strict RAG guardrails
        system_prompt = (
            "You are an expert Product Manager and Qualitative Researcher AI Assistant.\n"
            "Your task is to analyze the context of the user interview or research transcript.\n\n"
            "FIRST, classify the context into one of these modes:\n"
            "1. 'software': If the transcript is about a digital app, website, or software usability test.\n"
            "2. 'research': If the transcript is an informational interview, radio talk-show, podcast, policy discussion, or general qualitative topic (like travel safety, health advice, business strategy).\n\n"
            "OUTPUT STRUCTURE DYNAMICS:\n"
            "Based on the classified mode, structure your findings under the 'pain_points' and 'features' JSON arrays. To prevent UI crashes, you MUST keep these exact JSON keys, but adapt the content as follows:\n\n"
            "If mode is 'software':\n"
            "- 'pain_points' represents User Pain Points (usability friction, bugs, complaints).\n"
            "- 'features' represents Proposed Feature Requests (suggested solutions, app improvements).\n"
            "- RICE metrics represent standard Reach, Impact, Confidence, Effort.\n\n"
            "If mode is 'research':\n"
            "- 'pain_points' represents Key Challenges, Themes, or Risks identified in the talk (e.g., 'Uncertainty of travel coverage during disasters').\n"
            "- 'features' represents Actionable Recommendations or Strategic Next Steps (e.g., 'Pre-trip travel insurance checklist').\n"
            "- RICE metrics represent research prioritisation:\n"
            "  * Reach: Significance/Importance of the topic (1-10)\n"
            "  * Impact: Strategic Impact of adopting this recommendation (0.25 to 3.0)\n"
            "  * Confidence: Strength of evidence/agreement in the transcript (0.1 to 1.0)\n"
            "  * Effort: Ease of adoption/difficulty of execution (1-5 where 1 is easy, 5 is complex)\n\n"
            "STRICT CROSSTALK & HALLUCINATION GUARDRAILS:\n"
            "- You must ground EVERY pain point/challenge and feature/recommendation in actual cited source segments from the context.\n"
            "- Do NOT assume or extrapolate features or pain points that have no direct mention or strong implication in the transcript.\n"
            "- For each item, you must include a 'citations' array containing the exact segment_id, timestamp range, and quote from the context.\n"
            "- If the context has insufficient evidence for a topic, do NOT include it. If no relevant items are supported by the text, return empty arrays.\n"
            "- Do NOT invent quotes. The quotes MUST match the provided Segment Text exactly.\n"
            "- Automatically detect, cluster, and track conversation topics discussed during the meeting, creating a chronological list of topics with 'label', 'start_sec', 'end_sec', 'summary', and 'keywords'.\n\n"
            "You MUST respond ONLY with a valid JSON object matching the following structure:\n"
            "{\n"
            "  \"mode\": \"software\" | \"research\",\n"
            "  \"pain_points\": [\n"
            "    {\n"
            "      \"id\": \"pp_1\",\n"
            "      \"title\": \"Title of challenge or pain point\",\n"
            "      \"description\": \"Detailed explanation\",\n"
            "      \"severity\": \"High\" | \"Medium\" | \"Low\",\n"
            "      \"citations\": [\n"
            "        { \"segment_id\": 12, \"timestamp\": \"02:15s - 02:22s\", \"quote\": \"exact quote from the segment\" }\n"
            "      ]\n"
            "    }\n"
            "  ],\n"
            "  \"features\": [\n"
            "    {\n"
            "      \"id\": \"feat_1\",\n"
            "      \"title\": \"Title of recommendation or feature\",\n"
            "      \"description\": \"Explanation of the recommendation or feature\",\n"
            "      \"citations\": [\n"
            "        { \"segment_id\": 12, \"timestamp\": \"02:15s - 02:22s\", \"quote\": \"exact quote from the segment\" }\n"
            "      ],\n"
            "      \"rice\": {\n"
            "        \"reach\": 8,\n"
            "        \"impact\": 2.0,\n"
            "        \"confidence\": 0.9,\n"
            "        \"effort\": 2,\n"
            "        \"score\": 7.2\n"
            "      },\n"
            "      \"moscow\": \"Must-have\" | \"Should-have\" | \"Could-have\" | \"Won't-have\"\n"
            "    }\n"
            "  ],\n"
            "  \"topics\": [\n"
            "    {\n"
            "      \"id\": \"t_1\",\n"
            "      \"label\": \"Discussion segment title (e.g. Critique of Software Patents)\",\n"
            "      \"start_sec\": 120.0,\n"
            "      \"end_sec\": 480.0,\n"
            "      \"summary\": \"Brief summary of this conversation topic.\",\n"
            "      \"keywords\": [\"patents\", \"legal\", \"software\"]\n"
            "    }\n"
            "  ],\n"
            "  \"suggested_questions\": [\n"
            "    \"First specific question about this meeting (e.g. 'Why did Speaker 1 complain about checkout latency?')\",\n"
            "    \"Second specific question about this meeting\",\n"
            "    \"Third specific question about this meeting\"\n"
            "  ]\n"
            "}"
        )

        user_prompt = (
            f"Here is the context extracted from the interview transcripts:\n\n"
            f"{formatted_context}\n"
            f"Analyze this context and output the JSON structure containing pain_points and features based on the detected mode."
        )

        # 3. Call Groq
        response = self.client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        output_content = response.choices[0].message.content
        insights = json.loads(output_content)

        # 4. Programmatic Verification Guardrail
        # Double-check citations to make sure they match actual segments to prevent LLM hallucinations
        verified_pain_points = []
        segment_dict = {seg["id"]: seg for seg in context_segments}
        mode = insights.get("mode", "software")

        for pp in insights.get("pain_points", []):
            valid_citations = []
            for cit in pp.get("citations", []):
                seg_id = cit.get("segment_id")
                if seg_id in segment_dict:
                    actual_seg = segment_dict[seg_id]
                    cit["timestamp"] = f"{actual_seg['start']:.2f}s - {actual_seg['end']:.2f}s"
                    cit["speaker"] = actual_seg["speaker"]
                    valid_citations.append(cit)
            if valid_citations:
                pp["citations"] = valid_citations
                verified_pain_points.append(pp)

        verified_features = []
        for feat in insights.get("features", []):
            valid_citations = []
            for cit in feat.get("citations", []):
                seg_id = cit.get("segment_id")
                if seg_id in segment_dict:
                    actual_seg = segment_dict[seg_id]
                    cit["timestamp"] = f"{actual_seg['start']:.2f}s - {actual_seg['end']:.2f}s"
                    cit["speaker"] = actual_seg["speaker"]
                    valid_citations.append(cit)
            
            # Recalculate RICE score programmatically
            rice = feat.get("rice", {})
            reach = float(rice.get("reach", 1))
            impact = float(rice.get("impact", 1.0))
            confidence = float(rice.get("confidence", 0.5))
            effort = float(rice.get("effort", 1))
            if effort <= 0:
                effort = 1
            calculated_score = round((reach * impact * confidence) / effort, 2)
            rice["score"] = calculated_score
            feat["rice"] = rice
            
            if valid_citations:
                feat["citations"] = valid_citations
                verified_features.append(feat)

        return {
            "mode": mode,
            "pain_points": verified_pain_points,
            "features": verified_features,
            "topics": insights.get("topics", [])
        }

    def generate_prd(self, transcript_id: str, selected_features: List[Dict[str, Any]], selected_pain_points: List[Dict[str, Any]], mode: str = "software") -> str:
        """
        Generates a comprehensive Markdown PRD draft (for software mode) 
        or a Strategy Research Memo (for research mode).
        """
        if not self.client:
            raise ValueError("Groq API Key is not configured.")

        selected_data = f"MODE: {mode.upper()}\n"
        selected_data += "SELECTED CHALLENGES / PAIN POINTS:\n"
        for pp in selected_pain_points:
            selected_data += f"- {pp['title']} ({pp['severity']} severity): {pp['description']}\n"
            for cit in pp.get('citations', []):
                selected_data += f"  * Quote: \"{cit['quote']}\" (Speaker: {cit.get('speaker', 'N/A')})\n"
                
        selected_data += "\nSELECTED RECOMMENDATIONS / FEATURES:\n"
        for ft in selected_features:
            rice = ft.get('rice', {})
            selected_data += f"- {ft['title']} [Priority: {ft['moscow']}, RICE/Priority Score: {rice.get('score', 'N/A')}]: {ft['description']}\n"
            for cit in ft.get('citations', []):
                selected_data += f"  * Quote: \"{cit['quote']}\" (Speaker: {cit.get('speaker', 'N/A')})\n"

        if mode == "research":
            # Generate Research Executive Strategy Memo
            system_prompt = (
                "You are an expert Strategic Policy and Research Consultant.\n"
                "Your task is to write a highly professional, detailed, and clear Research Strategy Brief / Strategy Memo in Markdown.\n"
                "Your Strategy Memo must be grounded entirely in the selected qualitative research challenges and actionable recommendations provided.\n"
                "You should format the document with standard executive strategy headers:\n"
                "1. Title & Executive Metadata\n"
                "2. Executive Summary & Strategic Objectives\n"
                "3. Key Discussion Themes & Challenges (citing specific quotes from the transcript)\n"
                "4. Strategic Recommendations Backlog (a table detailing: ID, Recommendation, Action Plan, Importance Priority, Supporting Quotes)\n"
                "5. Next Steps & Adoption Path\n"
                "6. Risks & Limitations\n\n"
                "Be comprehensive, professional, and clear. Do not use placeholders. Write actual strategy recommendations based on the input."
            )
        else:
            # Standard Software PRD
            system_prompt = (
                "You are a Senior Technical Product Manager.\n"
                "Your task is to write a highly professional, detailed, and clear Product Requirement Document (PRD) in Markdown.\n"
                "Your PRD must be grounded entirely in the selected user research pain points and feature requests provided.\n"
                "You should format the document with standard PRD headers:\n"
                "1. Title & Metadata\n"
                "2. Executive Summary & Core Value Proposition\n"
                "3. Problem Statement (directly citing user quotes)\n"
                "4. Product Goals & Non-Goals\n"
                "5. User Personas & Scenarios\n"
                "6. Detailed Feature Requirements (A table detailing: Feature ID, Name, Description, Priority/MoSCoW, User Story)\n"
                "7. Success Metrics & KPIs\n"
                "8. Open Questions & Technical Risks\n\n"
                "Be comprehensive, professional, and clear. Do not use placeholders."
            )

        user_prompt = (
            f"Here is the qualitative research input containing findings, recommendations, and quotes:\n\n"
            f"{selected_data}\n\n"
            f"Generate a professional, fully-populated document in Markdown."
        )

        response = self.client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3
        )

        return response.choices[0].message.content

analyzer_service = AnalyzerService()
