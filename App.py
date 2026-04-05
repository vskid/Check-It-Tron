"""
app.py
FastAPI backend — expose /analyze endpoint
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from hackathon_agent import (
    extract_hackathon_info,
    search_similar_projects,
    compute_raw_signal,
)

app = FastAPI(title="Hackathon Research Agent API")

# Allow all origins (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    hackathon_url: str
    idea: str


TREND_MAP = {
    "HIGH":   "Crowded space — many similar projects exist. Find a unique angle or niche.",
    "MEDIUM": "Some competition found. Room to differentiate with better UX or a specific use case.",
    "LOW":    "Very few similar projects found. Potentially novel idea — validate carefully.",
}


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    try:
        hackathon_info   = extract_hackathon_info(req.hackathon_url)
        similar_projects = search_similar_projects(req.idea)
        raw_signal       = compute_raw_signal(similar_projects)

        return {
            "hackathon":       hackathon_info,
            "similar_projects": similar_projects,
            "trend_summary":   TREND_MAP[raw_signal],
            "raw_signal":      raw_signal,
        }
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}