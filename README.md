# CHECK-IT-TRON — Backend

Powered by **Browser Use Cloud SDK** (`browser-use-sdk`).

## Setup

```bash
# 1. Install dependencies (Python 3.11+ required)
pip install -r requirements.txt

# 2. Your .env is already set up with the API key.
#    It should look like:
#    BROWSER_USE_API_KEY=bu_iEj9MXEIvyGfJETVe39M01DJkk4aR1F66Ix94ogdtxo

# 3. Start the server
uvicorn main:app --reload --port 8000
```

## Test the agent directly

```bash
python agent.py
```

## API

### POST /analyze

**Free text:**
```json
{ "idea": "AI tool that validates hackathon ideas against past submissions" }
```

**Devpost URL:**
```json
{ "url": "https://devpost.com/software/some-project" }
```

**Response:**
```json
{
  "idea_summary": "...",
  "similar_projects": [{ "name": "...", "event": "...", "url": "...", "similarity": 74 }],
  "github_repo_count": 312,
  "trend_signals": { "most_common_tech": "OpenAI", "recent_submissions": 3, "peak_activity": "Jan 2025" },
  "hype_score": 58,
  "verdict": "trending",
  "verdict_reason": "...",
  "upgrade_suggestions": [{ "title": "...", "description": "..." }],
  "monthly_trend": [1, 1, 2, 3, 3, 4]
}
```

### GET /health
Returns `{ "status": "ok" }` — use this to confirm the server is up.
