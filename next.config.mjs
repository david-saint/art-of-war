/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Generated assets are content-stable: the generators never overwrite a
        // file that exists, so a URL names the same bytes for the life of the
        // deployment. Without this Next serves them with max-age=0 and every
        // visit revalidates forty-odd plates and stems one round trip at a time.
        // Regenerating an asset means giving it a new name.
        source: '/assets/generated/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}
export default nextConfig
