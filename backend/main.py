import os 
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from utils.rate_limiter import check_rate_limit

load_dotenv()

app = FastAPI()

allowed_origin = os.getenv("ALLOWED_ORIGIN")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin] if allowed_origin else [],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

class AnalyzeRequest(BaseModel):
    complaint: str
    captcha_token: str

class GenerateResponse(BaseModel):
    complaint: str
    answers: dict

def _validate_complaint(complaint:str) ->None:
    if not complaint or not complaint.strip():
        raise HTTPException(status_code=400, detail="Complaint cannot be empty")
    if len(complaint)>2000:
        raise HTTPException(status_code=400, detail="Complaint exceeds maximum 2000-character limit")
    
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/analyze")
async def analyze(payload: AnalyzeRequest, request: Request):
    client_ip = request.client.host
    check_rate_limit(client_ip)
    _validate_complaint(payload.complaint)
    return{" stub": "analyze okay", "complaint_length": len(payload.complaint)}

@app.post("/api/generate")
async def generate(payload: GenerateResponse, request:Request):
    client_ip = request.client.host
    check_rate_limit(client_ip)
    _validate_complaint(payload.complaint)
    return{" stub": "generate okay", "complaint_length": len(payload.complaint)}