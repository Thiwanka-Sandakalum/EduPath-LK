from app.tool_registry import TOOL_REGISTRY

def execute_tools(tool_names: list, question: str):
    results = []
    for name in tool_names:
        tool = TOOL_REGISTRY.get(name)
        if not tool:
            continue
        try:
            result = tool.invoke({"query": question})
        except Exception as e:
            result = f"Error executing {name}: {str(e)}"
        results.append({
            "source": name,
            "data": result
        })
    return results
