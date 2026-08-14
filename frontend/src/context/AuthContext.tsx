"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  userId: string | null;
  organizationId: string | null;
  login: (token: string, userId: string, organizationId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedOrgId = localStorage.getItem("organizationId");

    if (storedToken && storedUserId && storedOrgId) {
      setToken(storedToken);
      setUserId(storedUserId);
      setOrganizationId(storedOrgId);
    }
    setMounted(true);
  }, []);

  const login = (newToken: string, newUserId: string, newOrgId: string) => {
    setToken(newToken);
    setUserId(newUserId);
    setOrganizationId(newOrgId);
    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("organizationId", newOrgId);
    router.push("/");
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setOrganizationId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("organizationId");
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        organizationId,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
