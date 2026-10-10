# Integration instructions

Copy `src/AdvisoryReview.tsx` and `src/AdvisoryReview.css` into your existing `frontend/src/` folder. Do not replace your existing App.tsx.

Add this import to `frontend/src/App.tsx`:
```tsx
import AdvisoryReview from "./AdvisoryReview";
```
Render `<AdvisoryReview />` temporarily inside the existing app to test, or add it as a new sidebar page using your current navigation.

Before browser requests work, add this middleware to `backend/app/main.py` immediately after the `app = FastAPI(...)` line:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
```
Restart the backend. Keep the backend terminal running, then run `npm run build` from `frontend`.

Security: officer name is audit attribution, not authentication. Do not deploy this development API publicly without authentication/authorization.
