## Next frontend connection

First verify the API in `/docs`. Then connect your React page to:
- `GET http://127.0.0.1:8000/evidence/HH-DEMO-001`
- `POST http://127.0.0.1:8000/advisories/draft/HH-DEMO-001`
- `GET http://127.0.0.1:8000/advisories`
- `POST http://127.0.0.1:8000/advisories/{id}/review`
- `GET http://127.0.0.1:8000/audit`

For browser calls, add FastAPI CORS middleware for `http://localhost:5173` and `http://127.0.0.1:5173`. The officer name is audit attribution, not secure authentication. Do not expose this dev API publicly as-is.

Satellite next step: obtain a real field polygon/coordinates and use Copernicus Sentinel-2 NDVI. Official examples: https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Process/Examples/S2L2A.html. Satellite NDVI flags vegetation changes; it does not confirm a particular pest or disease.
