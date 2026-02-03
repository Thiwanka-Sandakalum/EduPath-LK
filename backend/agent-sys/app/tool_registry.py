from app.tools.state_uni_rag import search_state_uni
from app.tools.private_api import search_private_uni
from app.tools.google_search import google_search

TOOL_REGISTRY = {
    "state_university_rag": search_state_uni,
    "private_university_api": search_private_uni,
    "google_search": google_search,
}