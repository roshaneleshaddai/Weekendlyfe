"use client";
import { useAuth } from "../lib/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import apiService from "../lib/apiService";

export default function AuthNav() {
  const { auth, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    apiService.clearAuth();
    logout();
    router.push("/");
  };

  if (isAuthenticated) {
    return (
      <nav className="flex items-center space-x-4">
        <span className="text-sm text-slate-600 hidden sm:inline">
          Welcome back,{" "}
          <span className="font-medium text-slate-800">{auth?.user?.name}</span>
        </span>
        <motion.a
          href="/profile"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-zen-lime text-zen-black rounded-lg hover:bg-zen-lime/80 transition-colors text-sm font-medium"
        >
          👤 Profile
        </motion.a>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Logout
        </motion.button>
      </nav>
    );
  }

  return (
    <nav className="text-sm text-slate-600">
      <span className="hidden sm:inline">Plan • Share • Enjoy •</span>{" "}
      <a
        href="/login"
        className="text-sky-500 hover:text-sky-600 font-medium transition-colors"
      >
        Login
      </a>{" "}
      •{" "}
      <a
        href="/signup"
        className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
      >
        Sign up
      </a>
    </nav>
  );
}
