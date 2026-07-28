import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AnalysisResult = {
    id: string;
    limitations: string;
    improved_text: string;
    status: string;
    created_at: string;
};

function SkeletonBlock({ height = 120 }: { height?: number }) {
    return <div className="skeleton" style={{ height, borderRadius: 10, marginBottom: 10 }} />;
}

function CopyButton({ text, id }: { text: string; id: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    }, [text]);

    return (
        <button
            id={id}
            className="btn-ghost"
            onClick={handleCopy}
            style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
            {copied ? (
                <><span style={{ color: '#10b981' }}>✓</span> Copied!</>
            ) : (
                <><span>📋</span> Copy</>
            )}
        </button>
    );
}

export default function Result() {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'limitations' | 'improved'>('limitations');

    useEffect(() => {
        if (!id) return;
        const fetchResult = async () => {
            try {
                const res = await fetch(`/api/result/${id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed to load');
                setData(json);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to load result');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    const downloadImproved = useCallback(() => {
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
    }, [data]);

    return (
        <>
            <Head>
                <title>Analysis Result — README AI Enhancer</title>
            </Head>

            {/* Background orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '0 16px 60px' }}>

                {/* ── Header ── */}
                <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button
                            id="back-btn"
                            className="btn-ghost"
                            onClick={() => router.push('/')}
                            style={{ padding: '8px 14px', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            ← Back
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1.2rem' }}>✨</span>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>README<span className="gradient-text">AI</span></span>
                        </div>
                    </div>

                    {data && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {data.improved_text && (
                                <CopyButton id="copy-improved-btn" text={data.improved_text} />
                            )}
                            <button
                                id="download-btn"
                                className="btn-gradient"
                                onClick={downloadImproved}
                                style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                ⬇️ Download README.md
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Title ── */}
                <div style={{ maxWidth: 960, margin: '0 auto 24px', textAlign: 'center' }} className="animate-fade-up">
                    {loading ? (
                        <>
                            <div className="skeleton" style={{ height: 40, width: 320, margin: '0 auto 12px', borderRadius: 8 }} />
                            <div className="skeleton" style={{ height: 20, width: 220, margin: '0 auto', borderRadius: 6 }} />
                        </>
                    ) : error ? (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '24px', maxWidth: 480, margin: '0 auto' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚠️</div>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Something went wrong</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{error}</div>
                            <button className="btn-ghost" onClick={() => router.push('/')} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="badge badge-green" style={{ marginBottom: 12, display: 'inline-flex' }}>✓ Analysis Complete</div>
                            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, marginBottom: 6, letterSpacing: '-0.02em' }}>
                                Your README Has Been <span className="gradient-text">Enhanced</span>
                            </h1>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Generated {data ? new Date(data.created_at).toLocaleString() : ''}
                            </p>
                        </>
                    )}
                </div>

                {/* ── Tab bar (mobile) ── */}
                {!loading && !error && data && (
                    <div style={{ maxWidth: 960, margin: '0 auto 16px', display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
                        {(['limitations', 'improved'] as const).map((tab) => (
                            <button
                                key={tab}
                                id={`tab-${tab}`}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '10px 18px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                                    borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                                    transition: 'color 0.2s, border-color 0.2s',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {tab === 'limitations' ? '🔍 Limitations' : '✨ Improved README'}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Content Grid ── */}
                <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>

                    {/* ── Limitations Panel ── */}
                    <div
                        className="glass-card animate-fade-up"
                        style={{ padding: '24px', display: activeTab !== 'limitations' ? 'none' : undefined }}
                        id="limitations-panel"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.1rem' }}>🔍</span>
                                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Identified Limitations</h2>
                            </div>
                            {data?.limitations && <CopyButton id="copy-limitations-btn" text={data.limitations} />}
                        </div>

                        {loading ? (
                            <>
                                <SkeletonBlock height={20} />
                                <SkeletonBlock height={20} />
                                <SkeletonBlock height={20} />
                                <SkeletonBlock height={20} />
                                <SkeletonBlock height={20} />
                                <SkeletonBlock height={20} />
                            </>
                        ) : (
                            <div
                                style={{
                                    background: 'rgba(0,0,0,0.25)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    padding: '16px',
                                    maxHeight: 540,
                                    overflowY: 'auto',
                                }}
                            >
                                <div className="prose-dark">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {data?.limitations || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Improved README Panel ── */}
                    <div
                        className="glass-card animate-fade-up-delay-1"
                        style={{ padding: '24px', display: activeTab !== 'improved' ? 'none' : undefined }}
                        id="improved-panel"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.1rem' }}>✨</span>
                                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Improved README</h2>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {data?.improved_text && <CopyButton id="copy-improved-panel-btn" text={data.improved_text} />}
                                <button
                                    id="download-improved-btn"
                                    className="btn-gradient"
                                    onClick={downloadImproved}
                                    style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
                                >
                                    ⬇️ Download
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <>
                                <SkeletonBlock height={30} />
                                <SkeletonBlock height={20} />
                                <SkeletonBlock height={20} />
                                <SkeletonBlock height={80} />
                                <SkeletonBlock height={20} />
                                <SkeletonBlock height={20} />
                            </>
                        ) : (
                            <div
                                style={{
                                    background: 'rgba(0,0,0,0.25)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    padding: '16px',
                                    maxHeight: 540,
                                    overflowY: 'auto',
                                }}
                            >
                                <div className="prose-dark">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {data?.improved_text || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* ── Desktop: always show both ── */}
                <style>{`
                    @media (min-width: 768px) {
                        #limitations-panel,
                        #improved-panel {
                            display: block !important;
                        }
                        [id^="tab-"] {
                            display: none;
                        }
                    }
                `}</style>

                {/* ── CTA ── */}
                {!loading && !error && (
                    <div style={{ maxWidth: 960, margin: '24px auto 0', textAlign: 'center' }}>
                        <button
                            id="analyze-another-btn"
                            className="btn-ghost"
                            onClick={() => router.push('/')}
                            style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                        >
                            ← Analyze Another README
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}