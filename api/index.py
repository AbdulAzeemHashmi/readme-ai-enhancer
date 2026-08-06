from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from .gemini_client import analyze_readme
from .supabase_client import insert_analysis, update_analysis, get_analysis

app = FastAPI()

# Allow all origins for simplicity (adjust for production if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    try:
        record_id = insert_analysis(request.text)
        limitations, improved_text = analyze_readme(request.text)
        update_analysis(record_id, limitations, improved_text)
        return AnalyzeResponse(id=record_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/result/{id}", response_model=ResultResponse)
async def get_result(id: str):
    try:
        uuid.UUID(id)
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

@app.get("/api/healthz")
async def health_check():
    return {"status": "ok"}

# For local development (if run with uvicorn directly)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)