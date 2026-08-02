import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

// Try multiple models (in order of compatibility)
const MODEL_NAMES = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
];

let model: GenerativeModel | null = null;
let lastError: Error | null = null;

// Try each model until one works
for (const name of MODEL_NAMES) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const testModel = genAI.getGenerativeModel({ model: name });
        // Quick test to verify the model works
        await testModel.generateContent('test');
        model = testModel;
        console.log(`✅ Gemini model "${name}" initialized successfully.`);
        break;
    } catch (err: any) {
        console.warn(`❌ Model "${name}" failed:`, err.message || err);
        lastError = err;
    }
}

// If no model worked, throw an error
if (!model) {
    throw new Error(
        `No Gemini model available. Last error: ${lastError?.message || 'Unknown error'}\n` +
        'Make sure your API key is valid and the Gemini API is enabled.'
    );
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
    // TypeScript now knows `model` is not null because we checked above,
    // but we add an extra guard for safety.
    if (!model) {
        throw new Error('Gemini model is not initialized');
    }

    try {
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
        console.error('❌ Gemini API error:', error);
        throw new Error(`Gemini API error: ${error.message || error}`);
    }
}