from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from agent import run_hype_agent

app = FastAPI(
    title="CHECK-IT-TRON API",
    description="Hackathon idea hype score analyzer powered by Browser Use",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://check-it-tron.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    idea: Optional[str] = None
    url:  Optional[str] = None

class SimilarProject(BaseModel):
    name:       str
    event:      str = "unknown"
    url:        str = ""
    similarity: int = 0

class UpgradeSuggestion(BaseModel):
    title:       str
    description: str

class AnalyzeResponse(BaseModel):
    idea_summary:         Optional[str]           = None
    similar_projects:     List[SimilarProject]    = []
    github_repo_count:    int                     = 0
    trend_signals:        dict                    = {}
    hype_score:           int                     = 0
    verdict:              str                     = "unknown"
    verdict_reason:       Optional[str]           = None
    upgrade_suggestions:  List[UpgradeSuggestion] = []
    monthly_trend:        List[int]               = []
    error:                Optional[str]           = None

@app.get("/")
def root():
    return {"status": "online", "app": "CHECK-IT-TRON", "version": "2.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    if not req.idea and not req.url:
        raise HTTPException(
            status_code=422,
            detail="Provide either 'idea' (free text) or 'url' (Devpost project URL).",
        )

    try:
        result = await run_hype_agent(
            idea=req.idea or "",
            source_url=req.url or None,
        )

        if isinstance(result, dict) and result.get("error") and not result.get("hype_score"):
            raise HTTPException(status_code=500, detail=result["error"])

        raw_suggestions = result.get("upgrade_suggestions", [])
        normalized = []
        for i, s in enumerate(raw_suggestions):
            if isinstance(s, dict):
                normalized.append(UpgradeSuggestion(
                    title=s.get("title", f"Suggestion {i+1}"),
                    description=s.get("description", str(s)),
                ))
            else:
                normalized.append(UpgradeSuggestion(
                    title=f"Suggestion {i+1}",
                    description=str(s),
                ))

        raw_projects = result.get("similar_projects", [])
        projects = []
        for p in raw_projects:
            if isinstance(p, dict):
                projects.append(SimilarProject(
                    name=p.get("name", "Unknown"),
                    event=p.get("event", "unknown"),
                    url=p.get("url", ""),
                    similarity=int(p.get("similarity", 0)),
                ))

        return AnalyzeResponse(
            idea_summary=result.get("idea_summary"),
            similar_projects=projects,
            github_repo_count=int(result.get("github_repo_count", 0)),
            trend_signals=result.get("trend_signals", {}),
            hype_score=min(100, max(0, int(result.get("hype_score", 0)))),
            verdict=result.get("verdict", "unknown"),
            verdict_reason=result.get("verdict_reason"),
            upgrade_suggestions=normalized,
            monthly_trend=result.get("monthly_trend", []),
            error=result.get("error"),
        )

    except HTTPException:
        raise
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
