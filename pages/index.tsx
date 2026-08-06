import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const MAX_CHARS = 8000;

const STEPS = [
    { icon: '📤', label: 'Upload README' },
    { icon: '🔍', label: 'Find Limitations' },
    { icon: '✨', label: 'AI Rewrite' },
    { icon: '⬇️', label: 'Download' },
];

export default function Home() {
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const loadFile = useCallback((f: File) => {
        if (!f.name.endsWith('.md') && !f.name.endsWith('.txt')) {
            setError('Only .md and .txt files are supported.');
            return;
        }
        setError('');
        setFileName(f.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content.length > MAX_CHARS) {
                setError(`File is too long. Please keep it under ${MAX_CHARS.toLocaleString()} characters (file has ${content.length.toLocaleString()}).`);
            }
            setText(content);
        };
        reader.readAsText(f);
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        const f = e.dataTransfer.files?.[0];
        if (f) loadFile(f);
    }, [loadFile]);

    const handleDrag = useCallback((e: DragEvent<HTMLDivElement>, active: boolean) => {
        e.preventDefault();
        setDragActive(active);
    }, []);

    const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) loadFile(f);
    }, [loadFile]);

    const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setFileName('');
        const val = e.target.value;
        setText(val);
        if (val.length > MAX_CHARS) {
            setError(`Text exceeds ${MAX_CHARS.toLocaleString()} character limit.`);
        } else {
            setError('');
        }
    }, []);

    const clearInput = useCallback(() => {
        setText('');
        setFileName('');
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (error || !text.trim()) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push(`/result/${data.id}`);
            } else {
                setError(data.detail || data.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = !!text.trim() && !loading && !error;
    const charPercent = Math.min((text.length / MAX_CHARS) * 100, 100);
    const charColor = charPercent > 90 ? '#ef4444' : charPercent > 70 ? '#f59e0b' : '#6366f1';

    return (
        <>
            <Head>
                <title>README AI Enhancer - AI-Powered README Improvement</title>
            </Head>

            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '0 16px 60px' }}>

                <nav style={{ maxWidth: 760, margin: '0 auto', padding: '20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.4rem' }}>✨</span>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>README<span className="gradient-text">AI</span></span>
                    </div>
                    <div className="badge badge-purple">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} />
                        Powered by Gemini
                    </div>
                </nav>

                <div style={{ maxWidth: 760, margin: '0 auto', paddingTop: 48, textAlign: 'center' }} className="animate-fade-up">
                    <div className="badge badge-purple" style={{ marginBottom: 20, display: 'inline-flex' }}>
                        🚀 AI-Powered · Free · Instant
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.03em' }}>
                        Make Your README{' '}
                        <span className="gradient-text">Actually Good</span>
                    </h1>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>
                        Upload your README, let AI pinpoint every weakness, then get a fully rewritten professional version in seconds.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 48 }} className="animate-fade-up-delay-1">
                        {STEPS.map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: i < STEPS.length - 1 ? 8 : 0 }}>
                                <div className="step-pill">
                                    <span>{step.icon}</span>
                                    <span>{step.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 4px' }}>→</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ maxWidth: 760, margin: '0 auto' }} className="animate-fade-up-delay-2">
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <form onSubmit={handleSubmit}>

                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label htmlFor="readme-text-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Paste README Text
                                    </label>
                                    {text.length > 0 && (
                                        <span style={{ fontSize: '0.75rem', color: charColor, fontFamily: 'JetBrains Mono, monospace', transition: 'color 0.2s' }}>
                                            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <textarea
                                    id="readme-text-input"
                                    className="readme-textarea"
                                    value={text}
                                    onChange={handleTextChange}
                                    placeholder={'# My Project\n\nPaste your README markdown here...'}
                                    rows={10}
                                    disabled={loading}
                                    style={{ height: 200 }}
                                />
                                {text.length > 0 && (
                                    <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginTop: 4, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${charPercent}%`, background: charColor, transition: 'width 0.2s, background 0.2s', borderRadius: 1 }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div className="divider-gradient" style={{ flex: 1 }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>or upload a file</span>
                                <div className="divider-gradient" style={{ flex: 1 }} />
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <div
                                    id="file-drop-zone"
                                    className={`drop-zone ${dragActive ? 'active' : ''} ${fileName ? 'has-file' : ''}`}
                                    style={{ padding: '28px 20px', textAlign: 'center', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.4 : 1 }}
                                    onClick={() => !loading && fileInputRef.current?.click()}
                                    onDrop={!loading ? handleDrop : undefined}
                                    onDragOver={(e) => !loading && handleDrag(e, true)}
                                    onDragLeave={(e) => handleDrag(e, false)}
                                >
                                    {fileName ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '1.4rem' }}>📄</span>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#6ee7b7' }}>{fileName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Content loaded into editor</div>
                                            </div>
                                            <button
                                                type="button"
                                                id="clear-file-btn"
                                                onClick={(e) => { e.stopPropagation(); clearInput(); }}
                                                style={{ marginLeft: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#fca5a5', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '2rem', marginBottom: 8 }} className="animate-float">📂</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                                                {dragActive ? 'Drop it here!' : 'Drag and drop your file'}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                or <span style={{ color: '#818cf8', textDecoration: 'underline', textUnderlineOffset: 2 }}>browse</span> (.md or .txt, max 8,000 chars)
                                            </div>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    id="file-input"
                                    type="file"
                                    accept=".md,.txt"
                                    onChange={handleFileInput}
                                    style={{ display: 'none' }}
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: '0.83rem', color: '#fca5a5', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                id="enhance-btn"
                                className="btn-gradient"
                                disabled={!canSubmit}
                                style={{ width: '100%', padding: '14px 20px', fontSize: '1rem' }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                        <span style={{ display: 'flex', gap: 5 }}>
                                            <span className="loading-dot" />
                                            <span className="loading-dot" />
                                            <span className="loading-dot" />
                                        </span>
                                        Analyzing and Rewriting...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        ✨ Enhance My README
                                    </span>
                                )}
                            </button>

                            {loading && (
                                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>
                                    This usually takes 5 to 15 seconds. Please wait...
                                </p>
                            )}
                        </form>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }} className="animate-fade-up-delay-3">
                        {[
                            { icon: '🔍', title: 'Deep Analysis', desc: 'AI pinpoints every gap, ambiguity, and missing section.' },
                            { icon: '🪄', title: 'Full Rewrite', desc: 'Get a complete professional rewrite, not just suggestions.' },
                            { icon: '⬇️', title: 'Instant Download', desc: 'Download the improved README.md file immediately.' },
                        ].map((f) => (
                            <div key={f.title} className="glass-card" style={{ padding: '18px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{f.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, color: 'var(--text-primary)' }}>{f.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}