import os
from dotenv import load_dotenv
import google.genai as genai
from google.genai import types
from langchain.tools import tool

STORE_NAME = "student-handbook-store"
PDF_SOURCE = "student_handbook_english.pdf"

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=API_KEY)


def _get_file_search_store():
    stores = list(client.file_search_stores.list())
    return next((s for s in stores if s.display_name == STORE_NAME), None)


def _run_rag_query(question: str):
    print("Running RAG query...")
    file_search_store = _get_file_search_store()

    if not file_search_store:
        raise RuntimeError(
            "File Search store not found. Run ingestion pipeline first."
        )

    response = client.models.generate_content(
        model="gemma-3-27b-it",
        contents=question,
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

    page = None
    try:
        meta = getattr(response.candidates[0], "grounding_metadata", None)
        if meta and hasattr(meta, "citations") and meta.citations:
            citation = meta.citations[0]
            if isinstance(citation, dict):
                page = citation.get("page_number")
    except Exception:
        pass

    return {
        "answer": answer,
        "source": PDF_SOURCE,
        "page": page,
    }


@tool
def search_state_uni(query: str) -> str:
    """
    Use this tool to retrieve official information about
    state/government universities, UGC policies, admission rules,
    eligibility criteria, Z-score requirements, and handbook regulations.
    """
    print("Invoked State University RAG tool.")

    try:
        result = _run_rag_query(query)

        formatted_response = (
            f"State University Information:\n"
            f"Answer: {result['answer']}\n"
            f"Source: {result['source']}\n"
            f"Page: {result['page']}"
        )

        return formatted_response

    except Exception as e:
        print(f"Error retrieving state university information: {str(e)}")
        return f"Error retrieving state university information: {str(e)}"
