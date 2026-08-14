"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        // Register flow
        const regRes = await apiFetch("/v1/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            organization_name: organizationName,
            full_name: email.split("@")[0],
          }),
        });
        
        // Immediately log them in
        const loginRes = await apiFetch("/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        login(loginRes.access_token, regRes.user_id, regRes.organization_id);
        
      } else {
        // Login flow
        const loginRes = await apiFetch("/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        login(loginRes.access_token, loginRes.user_id, loginRes.organization_id);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-center items-center p-12 text-white">
        <h1 className="text-5xl font-bold mb-6 tracking-tight">ConvSearch.ai</h1>
        <p className="text-xl text-blue-100 max-w-lg text-center">
          Bring conversational AI to your product catalog in minutes. Powerful RAG architecture built for modern merchants.
        </p>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isRegister ? "Create your account" : "Sign in to your account"}
          </h2>
          
          <div className="mt-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? "Please wait..." : isRegister ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
