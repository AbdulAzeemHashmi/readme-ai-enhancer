from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from gemini_client import analyze_readme
from supabase_client import insert_analysis, update_analysis, get_analysis

app = FastAPI()

# CORS – allow your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://readme-ai-enhancer.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    id: str

class ResultResponse(BaseModel):
    id: str
    limitations: str
    improved_text: str
    status: str
    created_at: str

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    try:
        # 1. Insert processing record
        record_id = insert_analysis(request.text)
        
        # 2. Call Gemini
        limitations, improved_text = analyze_readme(request.text)
        
        # 3. Update record
        update_analysis(record_id, limitations, improved_text)
        
        return AnalyzeResponse(id=record_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/result/{id}", response_model=ResultResponse)
async def get_result(id: str):
    try:
        uuid.UUID(id)   # validate UUID
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    record = get_analysis(id)
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    
    return ResultResponse(
        id=record["id"],
        limitations=record["limitations"],
        improved_text=record["improved_text"],
        status=record["status"],
        created_at=record["created_at"]
    )

@app.get("/")
def root():
    return {"message": "README AI Enhancer Backend"}