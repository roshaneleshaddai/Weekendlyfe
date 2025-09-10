"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, saveAuth, clearAuth } from "./auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authData = getAuth();
    setAuth(authData);
    setLoading(false);
  }, []);

  const login = (token, user) => {
    saveAuth(token, user);
    setAuth({ token, user });
  };

  const logout = () => {
    clearAuth();
    setAuth(null);
  };

  const value = {
    auth,
    login,
    logout,
    loading,
    isAuthenticated: !!auth?.token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
