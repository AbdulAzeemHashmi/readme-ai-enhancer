import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-pro',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.7,
});

// Prompt for limitations
const limitationsPrompt = PromptTemplate.fromTemplate(`
You are an expert technical writer. Analyze the following README content and list its limitations, gaps, and areas for improvement. Be specific and constructive.

Content:
{text}

Limitations:
`);

// Prompt for improved version
const improvedPrompt = PromptTemplate.fromTemplate(`
Based on the original README and the identified limitations below, rewrite the entire README to be more professional, clear, and complete. Fix any issues mentioned.

Original:
{text}

Limitations:
{limitations}

Improved README:
`);

export async function analyzeReadme(text: string) {
    // Step 1: Get limitations
    const limitationsChain = limitationsPrompt.pipe(llm);
    const limitationsResult = await limitationsChain.invoke({ text });
    const limitations = limitationsResult.content as string;

    // Step 2: Generate improved version
    const improvedChain = improvedPrompt.pipe(llm);
    const improvedResult = await improvedChain.invoke({ text, limitations });
    const improvedText = improvedResult.content as string;

    return { limitations, improvedText };
}