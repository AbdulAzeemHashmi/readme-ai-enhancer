import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        const { data, error } = await supabase
            .from('readme_analyses')
            .select('id, limitations, improved_text, status, created_at')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Not found' });

        return res.status(200).json(data);
    } catch (error: unknown) {
        console.error('result fetch error:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch result';
        return res.status(500).json({ error: message });
    }
}
