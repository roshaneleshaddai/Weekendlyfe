import "./globals.css";
import { AuthProvider } from "../lib/AuthContext";
import AuthNav from "../components/AuthNav";

export const metadata = {
  title: "Weekendly - Your Perfect Weekend Planner",
  description:
    "Plan your perfect weekend with activities, themes, and time management",
};

export default function RootLayout({ children }) {
  // register service worker on client
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Delius&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-zen-light-gray min-h-screen font-sans">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="bg-zen-white shadow-sm border-b border-zen-light-gray">
              <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-zen-black rounded-lg flex items-center justify-center">
                    <span className="text-zen-lime font-bold text-sm">W</span>
                  </div>
                  <h1 className="text-2xl font-bold text-zen-black">
                    Weekendly
                  </h1>
                </div>
                <AuthNav />
              </div>
            </header>
            <main className="flex-1 max-w-7xl mx-auto p-4 w-full">
              {children}
            </main>
            <footer className="bg-zen-white border-t border-zen-light-gray py-6 mt-8">
              <div className="max-w-7xl mx-auto px-4 text-sm text-zen-black text-center">
                Made with ❤️ — Weekendly Planner • Plan your perfect weekend
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
