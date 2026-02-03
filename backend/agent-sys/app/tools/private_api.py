import logging
import os
import requests
from langchain.tools import tool

BASE_URL = os.getenv("PRIVATE_UNI_API_URL", "http://localhost:5000")


def _safe_get(url: str, params: dict | None = None):
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()


def _format_programs(data: dict) -> str:
    programs = data.get("data", [])
    if not programs:
        return "No programs found."

    formatted = []
    for p in programs[:10]:  
        formatted.append(
            f"""
Program Name: {p.get('name')}
Level: {p.get('level')}
Duration: {p.get('duration')}
Delivery Mode: {p.get('delivery_mode')}
Eligibility: {p.get('eligibility')}
"""
        )
    return "\n".join(formatted)


@tool
def search_private_uni(query: str) -> str:
    """
    Use this tool to retrieve information about private universities,
    their programs, academic levels, eligibility criteria,
    duration, delivery mode, and other program details.

    This tool queries the Private University API.
    """

    logger = logging.getLogger("agent-sys.private_api")

    try:
        query_lower = query.lower()

        if "institution id" in query_lower:
            institution_id = query.split()[-1] 
            url = f"{BASE_URL}/institutions/{institution_id}"
            data = _safe_get(url)
            return f"Institution Details:\n{data}"

        if "programs of" in query_lower:
            institution_id = query.split()[-1]
            url = f"{BASE_URL}/institutions/{institution_id}/programs"
            data = _safe_get(url)
            return _format_programs(data)

        params = {}

        if "undergraduate" in query_lower:
            params["level"] = "Undergraduate"

        if "postgraduate" in query_lower:
            params["level"] = "Postgraduate"

        if "online" in query_lower:
            params["delivery_mode"] = "Online"

        params["name"] = query

        url = f"{BASE_URL}/programs"
        data = _safe_get(url, params=params)

        formatted_programs = _format_programs(data)

        return f"Private University Programs:\n{formatted_programs}"

    except requests.HTTPError as e:
        return f"API Error: {str(e)}"
    except Exception as e:
        return f"Error retrieving private university information: {str(e)}"
