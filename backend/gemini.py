import google.generativeai as genai

genai.configure(api_key="AIzaSyBax0qdrfE8U0TzsW4OISS4VZ3DqLic20s")

model = genai.GenerativeModel("gemini-1.5-flash")  # or "gemini-pro", "gemini-1.5-pro", etc.

response = model.generate_content("Viết kịch bản video ngắn 100 từ về chủ đề AI trong giáo dục")
print(response.text)
