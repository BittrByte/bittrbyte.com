/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/developers", destination: "/developers.html" },
      { source: "/about", destination: "/about.html" },
      { source: "/partner", destination: "/partner.html" },
      { source: "/support", destination: "/support.html" },
      { source: "/archive", destination: "/archive.html" },
      { source: "/basket", destination: "/basket.html" },
      { source: "/thanks", destination: "/thanks.html" },
    ];
  },
};

export default nextConfig;
