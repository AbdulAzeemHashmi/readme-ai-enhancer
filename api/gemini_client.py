import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env from the root (Vercel sets env vars, but local needs this)
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set")

genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-1.5-flash"
model = genai.GenerativeModel(MODEL_NAME)

STYLE_RULES = """
STRICT FORMATTING RULES (you must follow all of them):
- Do NOT use em dashes or en dashes.
- Use a hyphen (-) or colon (:) wherever you would normally use a dash.
- Use emojis generously.
- Use proper Markdown headings, bullet points, code blocks, and tables.
- Write in clear, direct, professional English.
"""

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
    limitations_res = model.generate_content(limitations_prompt)
    limitations = limitations_res.text

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
    improved_res = model.generate_content(improved_prompt)
    improved_text = improved_res.text

    return limitations, improved_text