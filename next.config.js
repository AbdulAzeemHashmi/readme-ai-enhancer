/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Allow API routes to parse multipart/form-data (used for file upload)
    api: {
        bodyParser: false,
    },
};

module.exports = nextConfig;