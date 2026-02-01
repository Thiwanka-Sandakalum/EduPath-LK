# Student Handbook QA CLI

This CLI allows you to ask questions about the indexed `student_handbook_english.pdf` using Google's Gemini File Search API.

## Usage

1. **Ensure the PDF is indexed**
   - Run the setup CLI first if you haven't already:
     ```bash
     python cli/rag_cli.py --setup
     ```

2. **Ask a question**
   - Use the QA CLI:
     ```bash
     python cli/qa_cli.py --ask "What is the attendance policy?"
     ```

## Features
- Asks natural language questions against the indexed handbook
- Returns answers with citations

## Requirements
- Python 3.8+
- `google-genai`, `python-dotenv` (see rag_cli.py for setup)
- `.env` file with your `GEMINI_API_KEY`

## References
- [Gemini File Search API](https://ai.google.dev/gemini-api/docs/file-search)
