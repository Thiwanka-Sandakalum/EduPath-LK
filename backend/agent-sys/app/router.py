import json
import os
from dotenv import load_dotenv
from google import genai
load_dotenv()


# Initialize the client with the API key
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
client = genai.Client()
MODEL_ID = "gemma-3-27b-it"

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "prompts", "router_prompt.txt")
if os.path.exists(PROMPT_PATH):
    with open(PROMPT_PATH) as f:
        ROUTER_PROMPT = f.read()
else:
    # fallback for dev/test
    ROUTER_PROMPT = "You are a routing controller for a Higher Education advisory AI system."

def route_question(question: str, history: list):
    """
    Uses Gemini LLM to decide which tools to call.
    Returns parsed JSON: { tools: [...], reason: "..." }
    """
    full_prompt = f"""
{ROUTER_PROMPT}

Chat History:
{history}\n\nCurrent Question:\n{question}
"""
    print({"prompt": full_prompt})
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=full_prompt
        )
        # response.text is the generated string
        return json.loads(response.text)
    except Exception as e:
        print(f"Router LLM error: {e}")
        return {"tools": ["advisory_llm_only"], "reason": "Fallback routing"}
