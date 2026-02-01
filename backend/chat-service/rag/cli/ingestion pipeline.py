import os
import time
import argparse
import google.genai as genai
from dotenv import load_dotenv

def ingest_file_to_gemini(
    file_path: str,
    store_name: str,
    display_name: str,
    env_path: str = None
):
    """
    Indexes a file into Gemini File Search.
    Args:
        file_path (str): Path to the file to ingest.
        store_name (str): Name for the File Search store.
        display_name (str): Display name for the file in the store.
        env_path (str, optional): Path to .env file for API key. Defaults to '../.env'.
    """
    if env_path is None:
        env_path = os.path.join(os.path.dirname(__file__), '../.env')
    load_dotenv(env_path)
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise RuntimeError('GEMINI_API_KEY not found in .env')

    client = genai.Client(api_key=api_key)
    file_search_store = client.file_search_stores.create(config={'display_name': store_name})
    operation = client.file_search_stores.upload_to_file_search_store(
        file=file_path,
        file_search_store_name=file_search_store.name,
        config={'display_name': display_name}
    )
    while not operation.done:
        print(f'Indexing {os.path.basename(file_path)}, please wait...')
        time.sleep(5)
        operation = client.operations.get(operation)
    print(f'{display_name} indexed and ready for search.')

def main():
    parser = argparse.ArgumentParser(description='SAI ENG: Gemini File Ingestion Engine')
    parser.add_argument('--file', type=str, required=True, help='Path to the file to ingest')
    parser.add_argument('--store', type=str, required=True, help='Name for the File Search store')
    parser.add_argument('--display', type=str, required=True, help='Display name for the file in the store')
    parser.add_argument('--env', type=str, default=None, help='Path to .env file (default: ../.env)')
    args = parser.parse_args()

    ingest_file_to_gemini(
        file_path=os.path.abspath(args.file),
        store_name=args.store,
        display_name=args.display,
        env_path=args.env
    )

if __name__ == '__main__':
    main()
