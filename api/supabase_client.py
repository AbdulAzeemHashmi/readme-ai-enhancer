import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise ValueError("Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set.")
    
    return create_client(url, key)

def insert_analysis(text: str):
    client = get_supabase_client()
    result = client.table("readme_analyses").insert({
        "original_text": text,
        "status": "processing"
    }).execute()
    if not result.data:
        raise RuntimeError("Failed to insert analysis into database.")
    return result.data[0]["id"]

def update_analysis(id: str, limitations: str, improved_text: str):
    client = get_supabase_client()
    client.table("readme_analyses").update({
        "limitations": limitations,
        "improved_text": improved_text,
        "status": "completed"
    }).eq("id", id).execute()

def get_analysis(id: str):
    client = get_supabase_client()
    result = client.table("readme_analyses").select("*").eq("id", id).execute()
    if result.data:
        return result.data[0]
    return None