import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

STYLE_RULES = """
STRICT FORMATTING RULES (you must follow all of them):
- Do NOT use em dashes or en dashes.
- Use a hyphen (-) or colon (:) wherever you would normally use a dash.
- Use emojis generously.
- Use proper Markdown headings, bullet points, code blocks, and tables.
- Write in clear, direct, professional English.
"""

MODEL_NAMES = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
]

def get_api_key():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY environment variable is not configured.")
    return key

def generate_with_fallback(prompt: str) -> str:
    api_key = get_api_key()
    genai.configure(api_key=api_key)
    
    last_err = None
    for model_name in MODEL_NAMES:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            print(f"Gemini model '{model_name}' failed: {e}")
            last_err = e
            continue
            
    raise RuntimeError(f"All Gemini models failed. Last error: {last_err}")

def analyze_readme(text: str):
    limitations_prompt = f"""
You are an expert technical writer reviewing a README file.
Analyze the README content below and produce a numbered list of its specific limitations, gaps, and weak points.
Be concrete and actionable. Group similar issues together.

{STYLE_RULES}

README Content:
{text}

Limitations (numbered list):
"""
    limitations = generate_with_fallback(limitations_prompt)

    improved_prompt = f"""
You are an expert technical writer.
Rewrite the README below into a polished, professional, and complete document.
Address every limitation listed. The output must be valid Markdown only, with no explanation or commentary before or after.

{STYLE_RULES}
- Use animated badges from shields.io where appropriate
- Include emojis in section headings
- Structure with: Overview, Features, Tech Stack, Getting Started, Usage, Environment Variables, Contributing, License

Original README:
{text}

Identified Limitations to Fix:
{limitations}

Complete Improved README (Markdown only, starts with #):
"""
    improved_text = generate_with_fallback(improved_prompt)

    return limitations, improved_text