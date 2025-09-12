module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/external/:path*",
        destination: "http://localhost:4000/api/external/:path*",
      },
    ];
  },
};
