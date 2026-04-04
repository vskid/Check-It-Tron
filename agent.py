import asyncio
import json
import re
from browser_use_sdk.v3 import AsyncBrowserUse
from dotenv import load_dotenv

load_dotenv()

# Client auto-reads BROWSER_USE_API_KEY from .env
client = AsyncBrowserUse()


def build_task(idea: str, source_url: str = None) -> str:
    """Build the agent task string based on input type."""

    if source_url:
        idea_section = f"""
STEP 0 — Extract idea from Devpost URL:
Go to: {source_url}
Read the project title, description, and tech stack shown on the page.
Use that as the idea you will analyze in the steps below.
"""
    else:
        idea_section = f'The hackathon idea to analyze is: "{idea}"'

    search_query = (idea or "").replace(" ", "+")

    return f"""
You are CHECK-IT-TRON, a hackathon idea originality and hype analyzer.

{idea_section}

Follow these steps IN ORDER:

--- STEP 1: Search Devpost for similar projects ---
Go to: https://devpost.com/software/search?query={search_query}
Collect up to 5 results. For each project note:
  - Project name
  - Hackathon event name (if shown)
  - Full project URL (devpost.com/software/...)
  - Your estimated similarity to the analyzed idea (integer 0-100)

--- STEP 2: Check GitHub for related repos ---
Go to: https://github.com/search?q={search_query}&type=repositories
Read the total repository count shown (e.g. "1,243 repository results").
Also note the top 2 programming languages or technologies visible in the results.

--- STEP 3: Check recency on Devpost ---
Go to: https://devpost.com/software/search?query={search_query}&filters[attributes][]=recently_submitted
Count how many projects are visible. This indicates trend velocity.
Try to identify which month/year most were submitted.

--- STEP 4: Calculate hype score (integer 0-100) ---
Use this scoring logic:
  + (number of similar Devpost projects found) x 6   [max 30]
  + GitHub repo count: >1000 → +25, >500 → +18, >100 → +10, >10 → +5, else 0
  + Recent submissions: >5 → +15, >2 → +10, >0 → +5, else 0
  + If top result similarity > 80 → add +15
  Cap total at 100.

Verdict:
  0-30  → "pioneer"   — rare idea, go build it
  31-65 → "trending"  — popular but winnable with a twist
  66-100 → "saturated" — heavily done, needs major pivot

--- STEP 5: Generate 3 upgrade suggestions ---
Based on gaps you found, suggest 3 SPECIFIC features the team could add
to make the idea stand out from the similar projects you found.

--- OUTPUT ---
Return ONLY a valid JSON object. No markdown, no explanation, no backticks. Just raw JSON:

{{
  "idea_summary": "one sentence describing what was analyzed",
  "similar_projects": [
    {{
      "name": "project name",
      "event": "hackathon event or unknown",
      "url": "https://devpost.com/software/...",
      "similarity": 75
    }}
  ],
  "github_repo_count": 240,
  "trend_signals": {{
    "most_common_tech": "OpenAI + FAISS",
    "recent_submissions": 4,
    "peak_activity": "Jan 2025"
  }},
  "hype_score": 62,
  "verdict": "trending",
  "verdict_reason": "One sentence explaining why this verdict was assigned.",
  "upgrade_suggestions": [
    {{
      "title": "Short feature title",
      "description": "Specific actionable improvement based on gaps found"
    }},
    {{
      "title": "Short feature title",
      "description": "Specific actionable improvement based on gaps found"
    }},
    {{
      "title": "Short feature title",
      "description": "Specific actionable improvement based on gaps found"
    }}
  ],
  "monthly_trend": [1, 1, 2, 3, 3, 4]
}}
"""


async def run_hype_agent(idea: str, source_url: str = None) -> dict:
    """
    Run the Browser Use cloud agent to analyze a hackathon idea.

    Args:
        idea:       Free-text description of the idea
        source_url: Optional Devpost URL to extract the idea from

    Returns:
        Parsed dict with full hype score analysis
    """
    task = build_task(idea=idea, source_url=source_url)

    print(f"[CHECK-IT-TRON] Starting agent for: '{idea or source_url}'")

    result = await client.run(task)

    raw = result.output or ""
    print(f"[CHECK-IT-TRON] Raw output length: {len(raw)} chars")

    # Strip any accidental markdown fences
    cleaned = re.sub(r"```json|```", "", raw).strip()

    # Extract JSON object if surrounded by other text
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        cleaned = match.group(0)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"[CHECK-IT-TRON] JSON parse error: {e}")
        return {
            "error": "Agent returned unparseable output",
            "raw": raw,
            "idea_summary": idea or source_url,
            "similar_projects": [],
            "github_repo_count": 0,
            "trend_signals": {},
            "hype_score": 0,
            "verdict": "unknown",
            "verdict_reason": "Could not parse agent response.",
            "upgrade_suggestions": [],
            "monthly_trend": [],
        }


# Quick local test
if __name__ == "__main__":
    test_idea = "AI tool to check if a hackathon idea has been built before using semantic search on Devpost"
    result = asyncio.run(run_hype_agent(idea=test_idea))
    print(json.dumps(result, indent=2))
