import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type AnalysisResult = {
    id: string;
    original_text: string;
    limitations: string;
    improved_text: string;
    status: string;
    created_at: string;
};

export default function Result() {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchResult = async () => {
            try {
                const { data, error } = await supabase
                    .from('readme_analyses')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                setData(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    const downloadImproved = () => {
        if (!data?.improved_text) return;
        const blob = new Blob([data.improved_text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'README-improved.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Error: {error || 'Not found'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">📊 Analysis Result</h1>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2">🔍 Identified Limitations</h2>
                        <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{data.limitations}</pre>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2">✨ Improved README</h2>
                        <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{data.improved_text}</pre>
                        </div>
                        <button
                            onClick={downloadImproved}
                            className="mt-4 bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition"
                        >
                            ⬇️ Download Improved README.md
                        </button>
                    </div>

                    <div className="text-sm text-gray-500">
                        Created at: {new Date(data.created_at).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}