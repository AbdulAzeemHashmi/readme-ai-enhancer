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
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite-001",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
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
    combined_prompt = f"""
You are an expert technical writer reviewing and rewriting a README file.

Task 1: Analyze the README content below and produce a numbered list of its specific limitations, gaps, and weak points under the section header ===LIMITATIONS===.
Task 2: Rewrite the README into a polished, professional, and complete document addressing every limitation under the section header ===IMPROVED_README===.

{STYLE_RULES}
- Use animated badges from shields.io where appropriate
- Include emojis in section headings
- Structure the rewritten README with: Overview, Features, Tech Stack, Getting Started, Usage, Environment Variables, Contributing, License

Original README Content:
{text}

Produce your entire output using EXACTLY this section format (keep the delimiters intact):

===LIMITATIONS===
[Numbered list of limitations, gaps, and missing details]

===IMPROVED_README===
[Complete improved README markdown content starting with #]
"""
    raw_output = generate_with_fallback(combined_prompt)

    limitations = ""
    improved_text = ""

    if "===LIMITATIONS===" in raw_output and "===IMPROVED_README===" in raw_output:
        parts = raw_output.split("===IMPROVED_README===")
        limitations = parts[0].replace("===LIMITATIONS===", "").strip()
        improved_text = parts[1].strip()
    elif "===LIMITATIONS===" in raw_output:
        limitations = raw_output.replace("===LIMITATIONS===", "").strip()
        improved_text = limitations
    else:
        limitations = raw_output
        improved_text = raw_output

    return limitations, improved_text
