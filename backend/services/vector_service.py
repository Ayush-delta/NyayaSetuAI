import os
from groq import Groq
from services.pdf_processor import chunk_text
from services.storage_service import _get_client
from dotenv import load_dotenv

load_dotenv()

import requests

# ─── Hugging Face Embeddings (Zero RAM Usage) ─────────────────────────────
def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Calls Hugging Face's Inference API to get embeddings.
    This uses 0MB of your server's RAM!
    """
    # Using a 768-dimension model to match existing database schema
    model_id = "sentence-transformers/all-mpnet-base-v2"
    api_url = f"https://api-inference.huggingface.co/models/{model_id}"
    
    # Optional: You can add an HUGGINGFACE_API_KEY to .env for higher rate limits
    hf_token = os.getenv("HUGGINGFACE_API_KEY", "")
    headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}

    try:
        response = requests.post(api_url, headers=headers, json={"inputs": texts, "options": {"wait_for_model": True}})
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Embedding error: {e}")
        # Fallback: Return zero vectors if API fails (768 dimensions)
        return [[0.0] * 768 for _ in texts]


def create_vector_store(record_id: str, full_text: str) -> dict:
    """
    Chunk text, embed it, and store in Supabase pgvector.
    Returns metadata about the vector store.
    """
    # Step 1: Chunk the text
    chunks = chunk_text(full_text, chunk_size=500, overlap=100)

    if not chunks:
        return {"chunks": 0, "namespace": None}

    # Step 2: Embed chunks
    embeddings = get_embeddings(chunks)

    # Step 3: Connect to Supabase
    supabase = _get_client()

    # Delete existing chunks if re-processing
    try:
        supabase.table("document_chunks").delete().eq("record_id", record_id).execute()
    except Exception as e:
        print(f"Warning: could not delete old chunks: {e}")

    # Step 4: Add chunks to pgvector
    records_to_insert = []
    for i, chunk in enumerate(chunks):
        records_to_insert.append({
            "record_id": record_id,
            "chunk_index": i,
            "content": chunk,
            "embedding": embeddings[i]
        })
    
    supabase.table("document_chunks").insert(records_to_insert).execute()

    return {
        "chunks": len(chunks),
        "namespace": f"record_{record_id}",
    }


def retrieve_relevant_chunks(record_id: str, query: str, top_k: int = 5) -> list:
    """
    Given a query, retrieve the top_k most relevant chunks from the record's
    pgvector table using the match_document_chunks RPC function.
    """
    # Embed the query
    query_embedding = get_embeddings([query])[0]
    
    supabase = _get_client()

    try:
        # Call the Supabase RPC function for cosine similarity search
        response = supabase.rpc(
            "match_document_chunks",
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.0,  # return everything, limit by match_count
                "match_count": top_k,
                "filter_record_id": record_id
            }
        ).execute()

        chunks = []
        for row in response.data:
            chunks.append({
                "chunk": row["content"],
                "score": float(row["similarity"])
            })
        return chunks
    except Exception as e:
        print(f"Error querying pgvector: {e}")
        return []


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