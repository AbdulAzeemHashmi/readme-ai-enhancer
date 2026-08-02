import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase environment variables not set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_analysis(text: str):
    """Insert a new analysis with status 'processing' and return the record id."""
    result = supabase.table("readme_analyses").insert({
        "original_text": text,
        "status": "processing"
    }).execute()
    return result.data[0]["id"]

def update_analysis(id: str, limitations: str, improved_text: str):
    """Update the analysis record with the results."""
    supabase.table("readme_analyses").update({
        "limitations": limitations,
        "improved_text": improved_text,
        "status": "completed"
    }).eq("id", id).execute()

def get_analysis(id: str):
    """Fetch a single analysis by id."""
    result = supabase.table("readme_analyses").select("*").eq("id", id).execute()
    if result.data:
        return result.data[0]
    return None