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

        // Insert into Supabase
        const { data: record, error: insertError } = await supabase
            .from('readme_analyses')
            .insert({ original_text: text, status: 'processing' })
            .select('id')
            .single();

        if (insertError) {
            console.error('Supabase insert error:', insertError);
            throw new Error(`Database insert failed: ${insertError.message}`);
        }

        // Call Gemini
        const { limitations, improvedText } = await analyzeReadme(text);

        // Update record
        const { error: updateError } = await supabase
            .from('readme_analyses')
            .update({
                limitations,
                improved_text: improvedText,
                status: 'completed',
            })
            .eq('id', record.id);

        if (updateError) {
            console.error('Supabase update error:', updateError);
            throw new Error(`Database update failed: ${updateError.message}`);
        }

        return res.status(200).json({ id: record.id });
    } catch (error: any) {
        // Log full error details for debugging
        console.error('❌ API /analyze error:', error);

        // Return a clear message to the client
        const message = error.message || 'Internal server error';
        return res.status(500).json({ error: message });
    }
}