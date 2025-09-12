module.exports = {
  reactStrictMode: false, // Disabled to fix react-beautiful-dnd compatibility issues
  async rewrites() {
    return [
      {
        source: "/api/external/:path*",
        destination: "http://localhost:4000/api/external/:path*",
      },
    ];
  },
};
