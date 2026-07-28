import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        } else {
            formData.append('text', text);
        }

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                router.push(`/result/${data.id}`);
            } else {
                alert(data.error || 'Something went wrong');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">📄 README AI Enhancer</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Paste your README text</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-3 h-40"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Or paste markdown here..."
                            disabled={!!file}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Or upload a .md / .txt file</label>
                        <input
                            type="file"
                            accept=".md,.txt"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={text.length > 0}
                        />
                        {file && <p className="text-sm text-gray-600 mt-1">Selected: {file.name}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || (!text && !file)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Enhancing...' : 'Enhance README'}
                    </button>
                </form>
            </div>
        </div>
    );
}