import logging
from langchain.tools import tool
from google import genai
from google.genai import types
import os

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

@tool
def google_search(query: str) -> dict:
    """
    Perform a grounded Google Search using Gemini and return:
    - grounded answer
    - search queries used
    - cited web sources
    """
    logger = logging.getLogger("agent-sys.google_search")
    logger.info(f"Running Google Search query: {query}")
    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )

    config = types.GenerateContentConfig(
        tools=[grounding_tool],
        temperature=0  
    )

    response = client.models.generate_content(
        model="gemma-3-27b-it",
        contents=query,
        config=config,
    )

    answer_text = response.text

    metadata = {}
    if response.candidates and response.candidates[0].grounding_metadata:
        gm = response.candidates[0].grounding_metadata

        metadata = {
            "web_search_queries": gm.web_search_queries,
            "sources": [
                {
                    "title": chunk.web.title,
                    "url": chunk.web.uri
                }
                for chunk in gm.grounding_chunks
                if chunk.web
            ]
        }

    return {
        "answer": answer_text,
        "grounding_metadata": metadata
    }
