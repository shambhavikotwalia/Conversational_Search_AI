"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, userId } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router]);

  // If on login page, don't show the sidebar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="font-bold text-lg text-gray-900 tracking-tight">
            ConvSearch<span className="text-blue-600">.ai</span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link href="/" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/playground" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">
            Search Playground
          </Link>
          <Link href="/websites" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">
            Websites
          </Link>
          <Link href="/data" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">
            Data & Ingestion
          </Link>
          <Link href="/api-keys" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">
            API Keys
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center truncate">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              U
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-gray-700 truncate">Logged In</p>
              <p className="text-xs text-gray-500 truncate" title={userId || ""}>{userId ? userId.substring(0,8) + "..." : "User"}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="ml-2 text-xs text-red-600 hover:text-red-800 font-semibold bg-red-50 px-2 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-900 capitalize">
            {pathname === "/" ? "Overview" : pathname.replace("/", "").replace("-", " ")}
          </h1>
          <div>
            <span className="text-sm text-gray-500">
              Env: <span className="font-mono bg-gray-100 px-2 py-1 rounded">Development</span>
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}
