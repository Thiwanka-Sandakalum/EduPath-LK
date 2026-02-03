
import os
from dotenv import load_dotenv
import google.genai as genai


load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY not found in .env")
client = genai.Client(api_key=API_KEY)
MODEL_ID = "gemma-3-27b-it"

ANSWER_PROMPT = """
You are an AI Higher Education Advisor specializing in Sri Lankan and international universities.

Your job is to generate a final response using:

1. Chat history (for context and follow-up understanding)
2. Tool results (state university RAG, private university API, scholarship data, Google grounding)
3. The user's current question

STRICT RULES:

- Use ONLY information present in the provided Tool Data.
- If information is missing, clearly state: "This information is not available in the current data."
- Do NOT hallucinate or assume facts.
- If Google Search grounding data is included, preserve citations exactly as provided.
- If multiple sources provide overlapping information, reconcile them logically.

RESPONSE STRUCTURE:

1. Direct Answer Summary (2–4 sentences)
2. Detailed Breakdown:
   - Separate sections per university if comparing
   - Separate section for scholarships if applicable
   - Separate section for deadlines or latest updates if applicable
3. If relevant, provide a short advisory recommendation section:
   - Eligibility considerations
   - Financial considerations
   - Next steps

If this is a follow-up question, use chat history to resolve references like:
- "that university"
- "its deadline"
- "compare again"

Maintain clarity, professional tone, and structured formatting.
Avoid unnecessary verbosity.
"""


def generate_answer(question: str, tool_results: list, history: list):
    formatted_history = "\n".join(
        [f"{h['role'].upper()}: {h['content']}" for h in history]
    )
    context_block = "\n\n".join(
        [f"=== SOURCE: {tr['source']} ===\n{tr['data']}" for tr in tool_results]
    )
    full_prompt = f"""
{ANSWER_PROMPT}

CHAT HISTORY:
{formatted_history}

CURRENT QUESTION:
{question}

TOOL DATA:
{context_block}
"""
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=full_prompt
        )
        return response.text
    except Exception as e:
        print(f"Answer LLM error: {e}")
        return "[Error generating answer]"
