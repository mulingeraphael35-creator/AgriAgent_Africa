# AgriAgent Africa — Phase 1 backend starter

Adds a local API for evidence-backed advisory drafts, officer review, and audit logs.

**Honesty/safety:** household records are synthetic demo data; the risk score is a transparent heuristic, not a trained/validated ML model; no SMS is sent; satellite data is not connected yet. Do not treat demo prices or readings as real.

## Run on Windows
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open http://127.0.0.1:8000/docs

Endpoints: `GET /health`, `GET /evidence/HH-DEMO-001`, `POST /advisories/draft/HH-DEMO-001`, `GET /advisories`, `POST /advisories/{id}/review`, `GET /audit`.

The review endpoint only records an officer decision. It does not send a farmer message or place an order.
