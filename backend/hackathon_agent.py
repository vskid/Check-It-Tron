"""
hackathon_agent.py
Core logic: extract hackathon info + search similar projects
via Browser Use Cloud REST API (pure requests, no extra LLM key needed)
"""

import json
import time
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BROWSER_USE_API_KEY = os.getenv("BROWSER_USE_API_KEY")
BASE_URL = "https://api.browser-use.com/api/v1"
HEADERS = {
    "Authorization": f"Bearer {BROWSER_USE_API_KEY}",
    "Content-Type": "application/json",
}


# ─────────────────────────────────────────
# HELPER: Clean JSON string from agent output
# ─────────────────────────────────────────
def clean_json(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        # Remove opening fence (e.g. ```json or ```)
        raw = raw.split("```", 2)[1]
        # Remove "json" language tag if present
        if raw.startswith("json"):
            raw = raw[4:]
        # Remove closing fence if present
        if raw.endswith("```"):
            raw = raw[:-3]
    return raw.strip()


# ─────────────────────────────────────────
# HELPER: Send task to Browser Use, poll until done
# ─────────────────────────────────────────
def run_task(task_prompt: str, timeout: int = 180) -> str:
    response = requests.post(
        f"{BASE_URL}/run-task",
        headers=HEADERS,
        json={"task": task_prompt},
    )
    response.raise_for_status()
    task_data = response.json()

    task_id  = task_data["id"]
    live_url = task_data.get("live_url", "N/A")
    print(f"  [task_id] {task_id}")
    print(f"  [preview] {live_url}")

    start = time.time()
    while True:
        elapsed = time.time() - start
        if elapsed > timeout:
            raise TimeoutError(f"Task {task_id} timed out after {timeout}s")

        time.sleep(3)

        status_res = requests.get(f"{BASE_URL}/task/{task_id}", headers=HEADERS)
        status_res.raise_for_status()
        data = status_res.json()
        status = data.get("status", "")
        print(f"  [status] {status} ({int(elapsed)}s)")

        if status == "finished":
            return data.get("output") or data.get("result") or ""
        elif status == "failed":
            raise RuntimeError(f"Task failed: {data.get('error', 'unknown')}")


# ─────────────────────────────────────────
# FUNCTION 1: Extract hackathon info from URL
# ─────────────────────────────────────────
def extract_hackathon_info(url: str) -> dict:
    task = f"""
    Go to this URL: {url}

    Scroll through the entire page. Read all sections including About, Tracks, Judging, Prizes, Sponsors, Challenges.

    Extract the following information.
    Return ONLY a valid raw JSON object. No explanation. No markdown. No preamble.

    {{
      "name": "hackathon name",
      "description": "1-2 sentence objective or theme of the hackathon",
      "tracks": ["track 1", "track 2"],
      "judging_criteria": ["criteria 1", "criteria 2"],
      "sponsors": ["sponsor 1", "sponsor 2"],
      "sponsor_challenges": ["challenge 1", "challenge 2"]
    }}

    Rules:
    - If a field is not found, use [] for lists or "" for strings.
    - Be concise. Do not include explanations.
    - Return ONLY the JSON object. Nothing else.
    """

    print("[*] Extracting hackathon info...")
    raw = run_task(task)

    try:
        return json.loads(clean_json(raw))
    except json.JSONDecodeError:
        print("[!] JSON parse failed, returning raw string")
        return {"error": "parse_failed", "raw": raw}


# ─────────────────────────────────────────
# FUNCTION 2: Search similar projects
# ─────────────────────────────────────────
def search_similar_projects(idea: str) -> list:
    query = idea.replace(" ", "+")

    task = f"""
    I am building a project with this idea: "{idea}"

    Find similar existing hackathon projects. Follow these steps in order:

    Step 1: Go to https://devpost.com/software/search?query={query}
    Find the 3-4 most relevant projects. Only include projects that clearly match the idea.

    Step 2: Go to https://github.com/search?q={query}+hackathon&type=repositories&s=updated&o=desc
    Find 2-3 relevant repositories. Prefer repos updated in the last 3 months. Avoid duplicates.

    Step 3: Return ONLY a raw JSON array. No explanation. No markdown. No preamble.

    [
      {{
        "title": "Project Name",
        "source": "Devpost",
        "url": "https://...",
        "reason": "One sentence why it is similar to the idea"
      }}
    ]

    Rules:
    - Only include projects clearly related to the idea.
    - Maximum 8 results total.
    - Avoid duplicate projects.
    - Return ONLY the JSON array. Nothing else.
    """

    print("[*] Searching similar projects...")
    raw = run_task(task)

    try:
        return json.loads(clean_json(raw))
    except json.JSONDecodeError:
        print("[!] JSON parse failed, returning empty list")
        return []


# ─────────────────────────────────────────
# HELPER: Compute raw signal
# ─────────────────────────────────────────
def compute_raw_signal(similar_projects: list) -> str:
    count = len(similar_projects)
    if count >= 6:
        return "HIGH"
    elif count >= 3:
        return "MEDIUM"
    else:
        return "LOW"
