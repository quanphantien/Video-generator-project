from .gemini import generate_content

def generate_script(keyword: str, length: int) -> str:
    # Gọi LLM (OpenAI GPT/DeepSeek/Mistral) để sinh kịch bản
    return generate_content("Tạo kịch bản chủ đề về "+keyword)
