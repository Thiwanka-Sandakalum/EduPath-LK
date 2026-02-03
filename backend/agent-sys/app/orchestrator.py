from dotenv import load_dotenv
load_dotenv()

from app.router import route_question
from app.tool_executor import execute_tools
from app.answer import generate_answer

MAX_HISTORY = 6
chat_history = []

def handle_question(user_question: str):
    global chat_history

    # 1. Route question
    routing = route_question(user_question, chat_history)
    tool_names = routing.get("tools", [])
    print(f"Routed tools: {tool_names}")
    
    tool_results = ["search_state_uni"]

    # # 2. Advisory-only shortcut
    # if tool_names == ["advisory_llm_only"]:
    #     tool_results = []

    # # 3. If no tools selected → fallback to advisory mode
    # elif not tool_names:
    #     tool_results = []

    # # 4. Execute selected tools
    # else:
    try:
        tool_results = execute_tools(tool_names, user_question)
        print(f"Tool results: {tool_results}")
    except Exception as e:
        # Fail gracefully — do not crash chat
        tool_results = [{
            "source": "system",
            "data": f"Tool execution error: {str(e)}"
        }]

    # 5. Generate final response
    final_answer = generate_answer(
        question=user_question,
        tool_results=tool_results,
        history=chat_history
    )

    # 6. Update rolling memory
    chat_history.append({"role": "user", "content": user_question})
    chat_history.append({"role": "assistant", "content": final_answer})
    chat_history = chat_history[-MAX_HISTORY:]

    return final_answer
