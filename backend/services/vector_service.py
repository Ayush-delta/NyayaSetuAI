import os
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from services.pdf_processor import chunk_text
from dotenv import load_dotenv

load_dotenv()

VECTOR_STORE_DIR = "vector_store"
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

# Load embedding model once
print("Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")
EMBEDDING_DIM = 384

def create_vector_store(record_id: str, full_text: str) -> dict:
    """
    Chunk text, embed it, and save a FAISS index per record.
    Returns metadata about the vector store.
    """
    # Step 1: Chunk the text
    chunks = chunk_text(full_text, chunk_size=500, overlap=100)
    
    if not chunks:
        return {"chunks": 0, "namespace": None}
    
    # Step 2: Embed chunks
    embeddings = embedder.encode(chunks, show_progress_bar=False)
    embeddings = np.array(embeddings).astype("float32")
    
    # Step 3: Create FAISS index
    index = faiss.IndexFlatL2(EMBEDDING_DIM)
    index.add(embeddings)
    
    # Step 4: Save index + chunks to disk (one per record)
    namespace = f"record_{record_id}"
    index_path = os.path.join(VECTOR_STORE_DIR, f"{namespace}.index")
    chunks_path = os.path.join(VECTOR_STORE_DIR, f"{namespace}.chunks")
    
    faiss.write_index(index, index_path)
    with open(chunks_path, "wb") as f:
        pickle.dump(chunks, f)
    
    return {
        "chunks": len(chunks),
        "namespace": namespace,
        "index_path": index_path
    }

def retrieve_relevant_chunks(record_id: str, query: str, top_k: int = 5) -> list:
    """
    Given a query, retrieve the top_k most relevant chunks from the record's vector store.
    Used to give Llama 3 focused context instead of the full text.
    """
    namespace = f"record_{record_id}"
    index_path = os.path.join(VECTOR_STORE_DIR, f"{namespace}.index")
    chunks_path = os.path.join(VECTOR_STORE_DIR, f"{namespace}.chunks")
    
    if not os.path.exists(index_path):
        return []
    
    # Load index and chunks
    index = faiss.read_index(index_path)
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)
    
    # Embed query
    query_embedding = embedder.encode([query]).astype("float32")
    
    # Search
    distances, indices = index.search(query_embedding, top_k)
    
    # Return relevant chunks
    results = []
    for i, idx in enumerate(indices[0]):
        if idx < len(chunks):
            results.append({
                "chunk": chunks[idx],
                "score": float(distances[0][i])
            })
    
    return results

def get_context_for_extraction(record_id: str) -> str:
    """
    Get the most relevant chunks for legal extraction queries.
    Combines results from multiple targeted queries.
    """
    queries = [
        "court order directions compliance deadline",
        "petitioner respondent parties case number",
        "appeal limitation period filing",
        "responsible department government action required"
    ]
    
    seen = set()
    all_chunks = []
    
    for query in queries:
        chunks = retrieve_relevant_chunks(record_id, query, top_k=3)
        for c in chunks:
            if c["chunk"] not in seen:
                seen.add(c["chunk"])
                all_chunks.append(c["chunk"])
    
    return "\n\n---\n\n".join(all_chunks[:8])