/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.pokemontcg.io',
                pathname: '/**',
            },
        ],
    },
    // Disable static export for dynamic pages
    output: undefined,
}

module.exports = nextConfig
