import os
import json
import re
import math
from typing import List, Dict, Any
from backend.config import settings

def tokenize(text: str) -> List[str]:
    # Lowercase and extract alphanumeric words
    return re.findall(r'\w+', text.lower())

class VectorStoreService:
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}

    def _get_index_path(self, transcript_id: str) -> str:
        return os.path.join(settings.INDEX_DIR, f"{transcript_id}.json")

    def add_transcript(self, transcript_id: str, segments: List[Dict[str, Any]]) -> None:
        """
        Stores transcript segments in a JSON file for lightweight text search.
        """
        if not segments:
            return
            
        indexed_data = {
            "transcript_id": transcript_id,
            "segments": segments
        }
        
        # Save to disk
        index_path = self._get_index_path(transcript_id)
        with open(index_path, "w", encoding="utf-8") as f:
            json.dump(indexed_data, f, ensure_ascii=False, indent=2)
            
        # Cache in memory
        self.cache[transcript_id] = indexed_data

    def _load_index(self, transcript_id: str) -> Dict[str, Any]:
        """
        Loads indexed transcript from cache or disk.
        """
        if transcript_id in self.cache:
            return self.cache[transcript_id]
            
        index_path = self._get_index_path(transcript_id)
        if not os.path.exists(index_path):
            raise FileNotFoundError(f"Index for transcript {transcript_id} does not exist.")
            
        with open(index_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        self.cache[transcript_id] = data
        return data

    def delete_transcript(self, transcript_id: str) -> None:
        """
        Removes transcript index from memory cache and deletes JSON index file from disk.
        """
        if transcript_id in self.cache:
            del self.cache[transcript_id]
            
        index_path = self._get_index_path(transcript_id)
        if os.path.exists(index_path):
            try:
                os.remove(index_path)
            except Exception as e:
                print(f"Error removing vector index file: {e}")

    def search(self, transcript_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Performs lightweight TF-IDF and word-overlap similarity search.
        """
        try:
            index_data = self._load_index(transcript_id)
        except FileNotFoundError:
            return []
            
        segments = index_data.get("segments", [])
        if not segments:
            return []
            
        query_tokens = tokenize(query)
        if not query_tokens:
            # Return first top_k segments if query is empty
            return [{"segment": seg, "score": 1.0} for seg in segments[:top_k]]
            
        # Calculate term frequency - inverse document frequency weights
        # Document frequency for terms in this transcript
        df = {}
        for seg in segments:
            tokens = set(tokenize(seg["text"]))
            for t in tokens:
                df[t] = df.get(t, 0) + 1
                
        num_docs = len(segments)
        
        scored_segments = []
        for seg in segments:
            seg_text = seg["text"]
            seg_tokens = tokenize(seg_text)
            seg_token_set = set(seg_tokens)
            
            # Compute TF-IDF score for matching query tokens
            score = 0.0
            for qt in query_tokens:
                if qt in seg_token_set:
                    # Term frequency in segment
                    tf = seg_tokens.count(qt) / max(len(seg_tokens), 1)
                    # Inverse document frequency
                    idf = math.log((num_docs + 1) / (df.get(qt, 0) + 0.5)) + 1
                    score += tf * idf
            
            # Phrase match bonus (gives precedence to consecutive keyword matches)
            if query.lower() in seg_text.lower():
                score += 2.0
                
            scored_segments.append((seg, score))
            
        # Sort descending by similarity score
        scored_segments.sort(key=lambda x: x[1], reverse=True)
        
        # Format results
        results = []
        for seg, score in scored_segments[:top_k]:
            results.append({
                "segment": seg,
                "score": float(score)
            })
            
        return results

vector_store_service = VectorStoreService()
