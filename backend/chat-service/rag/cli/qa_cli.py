import argparse
import sys
import os
import google.genai as genai
from google.genai import types
from dotenv import load_dotenv

def get_client(env_path=None):
    if env_path is None:
        env_path = os.path.join(os.path.dirname(__file__), '../.env')
    load_dotenv(env_path)
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print('GEMINI_API_KEY not found in .env')
        sys.exit(1)
    return genai.Client(api_key=api_key)

def ask_question(question, store_name, env_path=None, source_name=None):
    client = get_client(env_path)
    stores = list(client.file_search_stores.list())
    file_search_store = next((s for s in stores if s.display_name == store_name), None)
    if not file_search_store:
        print(f'File Search store "{store_name}" not found. Please run the ingestion pipeline first.')
        sys.exit(1)
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
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
    print('\nAnswer:')
    print('-' * 60)
    print(answer)
    print('-' * 60)
    meta = getattr(response.candidates[0], 'grounding_metadata', None)
    if meta and hasattr(meta, 'citations') and meta.citations:
        citation = meta.citations[0]
        page = citation.get('page_number') if isinstance(citation, dict) else None
        if page:
            print(f"(Source: {source_name or store_name}, page {page})")
        else:
            print(f"(Source: {source_name or store_name})")
    elif meta:
        print(f"(Source: {source_name or store_name})")

def main():
    parser = argparse.ArgumentParser(description='SIAI ENG: Gemini QA CLI')
    parser.add_argument('--store', type=str, required=True, help='Name of the File Search store to query')
    parser.add_argument('--env', type=str, default=None, help='Path to .env file (default: ../.env)')
    parser.add_argument('--source', type=str, default=None, help='Display name for the source (optional)')
    parser.add_argument('--ask', type=str, help='Ask a question (single question mode)')
    args = parser.parse_args()
    if args.ask:
        ask_question(args.ask, args.store, args.env, args.source)
    else:
        print("Interactive QA mode. Type your question and press Enter. Type 'exit' or 'quit' to stop.")
        while True:
            try:
                question = input('Q: ')
                if question.strip().lower() in {'exit', 'quit'}:
                    print('Exiting QA CLI.')
                    break
                if question.strip():
                    ask_question(question, args.store, args.env, args.source)
            except (KeyboardInterrupt, EOFError):
                print('\nExiting QA CLI.')
                break

if __name__ == '__main__':
    main()
