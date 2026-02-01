# RAG FastAPI Service

This FastAPI app exposes a /qa endpoint for question answering over the indexed student_handbook_english.pdf using Gemini File Search.

## Usage

1. **Install dependencies:**
   ```bash
   pip install fastapi uvicorn google-genai python-dotenv
   ```

2. **Run the API server:**
   ```bash
   uvicorn rag_api:app --reload
   ```

3. **Ask a question:**
   ```bash
   curl -X POST 'http://localhost:8000/qa' -H 'Content-Type: application/json' -d '{"question": "What is the attendance policy?"}'
   ```

## Endpoints
- `POST /qa` — Accepts JSON `{ "question": "..." }` and returns answer, source, and page (if available)
- `GET /` — Health check

## Notes
- Make sure the PDF is indexed first using the CLI setup.
- Requires `.env` with `GEMINI_API_KEY`.

## References
- [Gemini File Search API](https://ai.google.dev/gemini-api/docs/file-search)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
