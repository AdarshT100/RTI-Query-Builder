import os 
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from utils.rate_limiter import check_rate_limit
from services.ai_service import run_stage_one, run_stage_two

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

class GenerateRequest(BaseModel):
    complaint: str
    answers: dict

def _validate_complaint(complaint:str) ->None:
    if not complaint or not complaint.strip():
        raise HTTPException(status_code=400, detail="Complaint cannot be empty")
    if len(complaint)>2000:
        raise HTTPException(status_code=400, detail="Complaint exceeds maximum 2000-character limit")
    
async def _verify_turnstile(token:str) ->None:
    secret = os.getenv("TURNSTILE_SECRET_KEY")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data={"secret": secret, "response":token},
            )
            result = resp.json()
    except Exception as e:
        raise HTTPException(status_code=403, detail="Captcha verification failed")
    if not result.get("success"):
        raise HTTPException(status_code=403, detail="Captcha verification failed")
    
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/analyze")
async def analyze(payload: AnalyzeRequest, request: Request):
    client_ip = request.client.host
    check_rate_limit(client_ip)
    await _verify_turnstile(payload.captcha_token)
    _validate_complaint(payload.complaint)
    try:
        result = run_stage_one(payload.complaint)
    except ValueError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    return result    



@app.post("/api/generate")
async def generate(payload: GenerateRequest, request:Request):
    client_ip = request.client.host
    check_rate_limit(client_ip)
    _validate_complaint(payload.complaint)
    try:
        result = run_stage_two(payload.complaint, payload.answers)
    except ValueError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    return result


