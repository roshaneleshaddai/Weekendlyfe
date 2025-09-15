module.exports = {
  reactStrictMode: false, // Disabled to fix react-beautiful-dnd compatibility issues
  async rewrites() {
    return [
      {
        source: "/api/external/:path*",
        destination: "https://weekendlyfe.onrender.com/api/external/:path*",
      },
    ];
  },
};
