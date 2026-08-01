import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Validate API key exists
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use the most widely compatible model
const MODEL_NAME = 'gemini-pro';
let model: GenerativeModel;

try {
    model = genAI.getGenerativeModel({ model: MODEL_NAME });
} catch (err) {
    console.error(`Failed to initialize model "${MODEL_NAME}":`, err);
    throw new Error(`Gemini model initialization failed: ${err instanceof Error ? err.message : String(err)}`);
}

const STYLE_RULES = `
STRICT FORMATTING RULES (you must follow all of them):
- Do NOT use em dashes (the character that looks like ---)
- Do NOT use en dashes (the character that looks like --)
- Use a hyphen (-) or colon (:) wherever you would normally use a dash
- Use emojis generously to make sections visually engaging
- Use proper Markdown headings, bullet points, code blocks, and tables
- Write in clear, direct, professional English
`;

export async function analyzeReadme(text: string): Promise<{
    limitations: string;
    improvedText: string;
}> {
    try {
        // Step 1: Find limitations
        const limitationsResult = await model.generateContent(
            `You are an expert technical writer reviewing a README file.
Analyze the README content below and produce a numbered list of its specific limitations, gaps, and weak points.
Be concrete and actionable. Group similar issues together.

${STYLE_RULES}

README Content:
${text}

Limitations (numbered list):`
        );
        const limitations = limitationsResult.response.text();

        // Step 2: Rewrite the README
        const improvedResult = await model.generateContent(
            `You are an expert technical writer.
Rewrite the README below into a polished, professional, and complete document.
Address every limitation listed. The output must be valid Markdown only, with no explanation or commentary before or after.

${STYLE_RULES}
- Use animated badges from shields.io where appropriate
- Include emojis in section headings
- Structure with: Overview, Features, Tech Stack, Getting Started, Usage, Environment Variables, Contributing, License

Original README:
${text}

Identified Limitations to Fix:
${limitations}

Complete Improved README (Markdown only, starts with #):`
        );
        const improvedText = improvedResult.response.text();

        return { limitations, improvedText };
    } catch (error: any) {
        // Rethrow with more context
        throw new Error(`Gemini API error: ${error.message || error}`);
    }
}