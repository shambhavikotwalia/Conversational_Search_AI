"use client";

import { useState } from "react";
import { searchCatalogue } from "@/lib/api";

export default function SearchPlayground() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await searchCatalogue(query, "site_public_demo");
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setResult({ error: err.message || "Failed to connect to the search API." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Search Playground</h2>
        <p className="text-gray-500 text-sm">
          Test your RAG search engine. Ask a natural language question to see retrieved evidence, AI answer, and latency.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* Input Area */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <form onSubmit={handleSearch} className="flex space-x-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. What are some comfortable dresses for summer?"
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Enter a query above to see RAG results.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p>Analyzing query, retrieving vectors, and generating response...</p>
            </div>
          )}

          {result && result.error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm">
              {result.error}
            </div>
          )}

          {result && !result.error && (
            <div className="space-y-8">
              {/* Answer Box */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-5">
                <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">AI Generated Answer</h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {result.answer}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main content - Evidence */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Retrieved Products & Evidence</h3>
                  {result.products && result.products.length > 0 ? (
                    <div className="space-y-4">
                      {result.products.map((p: any, idx: number) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-md p-4">
                          <h4 className="font-medium text-sm text-gray-900">{p.name || `Product ${p.product_id}`}</h4>
                          <p className="text-xs text-gray-500 mt-1">{p.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No products returned.</p>
                  )}
                  
                  {result.citations && result.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Review Citations</h4>
                      <ul className="text-xs text-gray-600 space-y-2">
                        {result.citations.map((c: any, idx: number) => (
                          <li key={idx} className="bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="font-medium text-gray-800">[{idx}]</span> {c.snippet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sidebar - RAG Metrics */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">RAG Metrics</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500">Latency</p>
                      <p className="text-lg font-semibold text-gray-900">{result.latency_ms} ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Confidence Score</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {result.confidence.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {result.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Request ID</p>
                      <p className="text-xs font-mono text-gray-700 truncate">{result.request_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
