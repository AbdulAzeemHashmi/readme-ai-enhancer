import Head from 'next/head';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#07080f" />
                <meta name="description" content="README AI Enhancer - Upload your README, let AI find its limitations and rewrite it to be clearer, more professional, and complete. Download the improved version instantly." />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="README AI Enhancer" />
                <meta property="og:description" content="AI-powered README improvement tool. Find limitations and get a professional rewrite in seconds." />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="README AI Enhancer" />
                <meta name="twitter:description" content="AI-powered README improvement tool. Find limitations and get a professional rewrite in seconds." />
                <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}