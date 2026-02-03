from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from app.orchestrator import handle_question
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Higher Education QA Advisor")

app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../static")), name="static")

class QuestionRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(req: QuestionRequest):
    answer = handle_question(req.question)
    return {"answer": answer}

@app.get("/")
def serve_index():
    static_dir = os.path.join(os.path.dirname(__file__), "../static")
    return FileResponse(os.path.join(static_dir, "index.html"))
