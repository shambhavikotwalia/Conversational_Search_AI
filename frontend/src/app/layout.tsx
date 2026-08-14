import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Conversational Search AI",
  description: "B2B SaaS for Conversational RAG Search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 flex h-screen overflow-hidden`}>
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <span className="font-bold text-lg text-gray-900 tracking-tight">ConvSearch<span className="text-blue-600">.ai</span></span>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">Dashboard</Link>
            <Link href="/playground" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">Search Playground</Link>
            <Link href="/websites" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">Websites</Link>
            <Link href="/data" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">Data & Ingestion</Link>
            <Link href="/api-keys" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600">API Keys</Link>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Merchant User</p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Demo Store</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <h1 className="text-lg font-semibold text-gray-900">Overview</h1>
            <div>
              <span className="text-sm text-gray-500">Env: <span className="font-mono bg-gray-100 px-2 py-1 rounded">Development</span></span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
