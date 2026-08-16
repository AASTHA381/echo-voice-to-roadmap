import os
import json
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from backend.config import settings

class VectorStoreService:
    def __init__(self):
        # We load the lightweight embedding model. 
        # This will download all-MiniLM-L6-v2 (~90MB) on first initialization.
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.cache: Dict[str, Dict[str, Any]] = {}

    def _get_index_path(self, transcript_id: str) -> str:
        return os.path.join(settings.INDEX_DIR, f"{transcript_id}.json")

    def add_transcript(self, transcript_id: str, segments: List[Dict[str, Any]]) -> None:
        """
        Embeds each transcript segment and stores them along with their vectors in a JSON file.
        """
        if not segments:
            return

        texts = [seg["text"] for seg in segments]
        embeddings = self.model.encode(texts)
        
        # Convert numpy embeddings to list of floats for JSON serialization
        embeddings_list = embeddings.tolist()
        
        indexed_data = {
            "transcript_id": transcript_id,
            "segments": segments,
            "embeddings": embeddings_list
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

    def search(self, transcript_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Performs semantic similarity search against transcript segments.
        """
        index_data = self._load_index(transcript_id)
        segments = index_data["segments"]
        embeddings = np.array(index_data["embeddings"])
        
        # Embed the query
        query_vector = self.model.encode([query])[0]
        
        # Compute cosine similarity
        # Cosine similarity = dot(A, B) / (norm(A) * norm(B))
        dot_product = np.dot(embeddings, query_vector)
        norms_embeddings = np.linalg.norm(embeddings, axis=1)
        norm_query = np.linalg.norm(query_vector)
        
        # Prevent division by zero
        norms_embeddings[norms_embeddings == 0] = 1e-9
        if norm_query == 0:
            norm_query = 1e-9
            
        similarities = dot_product / (norms_embeddings * norm_query)
        
        # Get top K indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            results.append({
                "segment": segments[idx],
                "score": score
            })
            
        return results

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

vector_store_service = VectorStoreService()
