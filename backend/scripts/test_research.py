"""
Simple test script to call POST /ai/research on a running ProspectAI backend.

Usage:
    pip install requests
    python backend/scripts/test_research.py

Adjust `BASE_URL` if your server runs on a different host/port.
"""

import json
import sys

import requests

BASE_URL = "http://localhost:8000"
ENDPOINT = f"{BASE_URL}/ai/research"

payload = {
    "company_name": "Acme Logistics",
    "company_domain": "acme-logistics.com",
    "industry": "Logistics and Transportation",
    "geography": "United States",
    "company_size": "201-500",
    "business_model": "B2B logistics SaaS",
    "target_market": "mid-market shippers in North America",
    "current_initiatives": ["digital transformation", "automation of dispatch"],
    "signals": ["recent funding round", "job postings for data engineers", "press release about expansion"],
    "context": "Announced partnership with regional freight forwarder and expanding operations in Q2."
}

headers = {"Content-Type": "application/json"}

try:
    resp = requests.post(ENDPOINT, json=payload, headers=headers, timeout=30)
except Exception as exc:
    print("Request failed:", exc)
    sys.exit(2)

print("Status:", resp.status_code)
try:
    print(json.dumps(resp.json(), indent=2))
except Exception:
    print(resp.text)
