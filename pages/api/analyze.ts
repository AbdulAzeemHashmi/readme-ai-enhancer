import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { analyzeReadme } from '../../lib/gemini';

const MAX_CHARS = 8000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ error: 'No text provided' });
        }

        if (text.length > MAX_CHARS) {
            return res.status(400).json({
                error: `Input is too long. Please keep it under ${MAX_CHARS.toLocaleString()} characters (you have ${text.length.toLocaleString()}).`,
            });
        }

        const { data: record, error: insertError } = await supabase
            .from('readme_analyses')
            .insert({ original_text: text, status: 'processing' })
            .select('id')
            .single();

        if (insertError) throw insertError;

        const { limitations, improvedText } = await analyzeReadme(text);

        const { error: updateError } = await supabase
            .from('readme_analyses')
            .update({
                limitations,
                improved_text: improvedText,
                status: 'completed',
            })
            .eq('id', record.id);

        if (updateError) throw updateError;

        return res.status(200).json({ id: record.id });
    } catch (error: unknown) {
        console.error('analyze error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
}