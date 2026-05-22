# ProspectAI

Next.js 15 App Router TypeScript + Tailwind CSS starter for a dark modern SaaS UI (sidebar, dashboard, command palette)

Quick start:

```bash
pnpm install # or npm install
pnpm dev
```

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The FastAPI app exposes versioned routes under `/api/v1` and interactive docs at `/docs`.

AI integration:

Set `GEMINI_API_KEY` in `backend/.env` to enable Gemini 2.5 Flash Lite. Optional overrides:

```env
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MAX_RETRIES=3
GEMINI_REQUEST_TIMEOUT_SECONDS=30
```

Available AI endpoints:

- `POST /api/v1/ai/company-research`
- `POST /api/v1/ai/lead-qualification`
- `POST /api/v1/ai/decision-maker-reasoning`
- `POST /api/v1/ai/outreach-draft`
- `POST /api/v1/ai/outreach-draft/stream` for NDJSON streaming output
