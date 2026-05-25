/** @type {import('next').NextConfig} */
const nextConfig = {
   output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;
