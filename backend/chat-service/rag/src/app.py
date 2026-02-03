import os
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.genai as genai
from google.genai import types
from dotenv import load_dotenv

STORE_NAME = 'student-handbook-store'
PDF_SOURCE = 'student_handbook_english.pdf'

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
)
logger = logging.getLogger("rag_api")


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=os.path.dirname(__file__)), name="static")

class QARequest(BaseModel):
    question: str

class QAResponse(BaseModel):
    answer: str
    source: str
    page: int | None = None

def get_client():
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        logger.error('GEMINI_API_KEY not found in .env')
        raise RuntimeError('GEMINI_API_KEY not found in .env')
    return genai.Client(api_key=api_key)

def get_file_search_store(client):
    stores = list(client.file_search_stores.list())
    return next((s for s in stores if s.display_name == STORE_NAME), None)

def get_rag_answer(question: str) -> QAResponse:
    logger.info(f"Received question: {question}")
    client = get_client()
    file_search_store = get_file_search_store(client)
    if not file_search_store:
        logger.error('File Search store not found. Please run the ingestion pipeline first.')
        raise RuntimeError('File Search store not found. Please run the ingestion pipeline first.')
    SYSTEM_PROMPT = """
You are a Sri Lankan University Admissions Assistant specializing in the UGC Handbook 2024/2025.

ROLE:
- Provide accurate answers strictly based on retrieved content from the connected UGC Handbook knowledge base.

STRICT RULES:
1. Use ONLY information retrieved from the handbook documents.
2. Do NOT add assumptions, external knowledge, or fabricate details.
3. Structure every response using clear headings and bullet points where appropriate.
4. If the requested information is NOT found in the retrieved handbook content:
   - Clearly state that the information is not available in the UGC Handbook.
   - Then switch role to an academic advisor persona.
   - Provide general guidance based on your broader knowledge.
FORMAT:
- Use concise, well-structured sections.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[
                {"role": "system", "parts": [{"text": SYSTEM_PROMPT}]},
                {"role": "user", "parts": [{"text": question}]}
            ],
            config=types.GenerateContentConfig(
                tools=[
                    types.Tool(
                        file_search=types.FileSearch(
                            file_search_store_names=[file_search_store.name]
                        )
                    )
                ]
            )
        )
        answer = response.text.strip()
        meta = getattr(response.candidates[0], 'grounding_metadata', None)
        page = None
        if meta and hasattr(meta, 'citations') and meta.citations:
            citation = meta.citations[0]
            page = citation.get('page_number') if isinstance(citation, dict) else None
        logger.info(f"Answer generated. Page: {page}")
        return QAResponse(answer=answer, source=PDF_SOURCE, page=page)
    except Exception as e:
        logger.exception("Error during RAG answer generation")
        raise

@app.post('/qa', response_model=QAResponse)
async def qa_endpoint(req: QARequest, request: Request):
    try:
        return get_rag_answer(req.question)
    except Exception as e:
        logger.error(f"/qa error: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/")
def root():
    # Serve the chat UI HTML file
    ui_path = os.path.join(os.path.dirname(__file__), "ui.html")
    if not os.path.exists(ui_path):
        logger.warning(f"UI file not found: {ui_path}")
        raise HTTPException(status_code=404, detail="UI file not found.")
    return FileResponse(ui_path)
