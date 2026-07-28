import fs from 'fs/promises';
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
import { supabase } from '../../lib/supabase';
import { analyzeReadme } from '../../lib/gemini';
import { v4 as uuidv4 } from 'uuid';

export const config = {
    api: {
        bodyParser: false, // We need raw multipart data
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Parse form data (file or text)
        const form = new IncomingForm();
        const { fields, files } = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        let content: string | null = null;

        // If a file was uploaded (read its contents)
        if (files.file && Array.isArray(files.file) && files.file.length > 0) {
            const file = files.file[0];
            const fileBuffer = await fs.promises.readFile(file.filepath);
            content = fileBuffer.toString('utf-8');
        } else if (fields.text && Array.isArray(fields.text) && fields.text.length > 0) {
            content = fields.text[0];
        }

        if (!content) {
            return res.status(400).json({ error: 'No text or file provided' });
        }

        // 2. Insert original content into Supabase with status 'processing'
        const { data: record, error: insertError } = await supabase
            .from('readme_analyses')
            .insert({ original_text: content, status: 'processing' })
            .select('id')
            .single();

        if (insertError) throw insertError;

        // 3. Call AI analysis
        const { limitations, improvedText } = await analyzeReadme(content);

        // 4. Update record with results
        const { data: updated, error: updateError } = await supabase
            .from('readme_analyses')
            .update({
                limitations,
                improved_text: improvedText,
                status: 'completed',
            })
            .eq('id', record.id)
            .select('*')
            .single();

        if (updateError) throw updateError;

        res.status(200).json({ id: record.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}