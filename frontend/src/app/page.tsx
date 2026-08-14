"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAnalyticsOverview } from "@/lib/api";

export default function DashboardPage() {
  const { organizationId, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId && token) {
      getAnalyticsOverview(organizationId, token)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [organizationId, token]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6 text-black">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Searches */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Searches</h3>
          <p className="text-3xl font-bold text-gray-900">{data?.total_searches || 0}</p>
        </div>

        {/* Avg Confidence */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Confidence Score</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data?.avg_confidence ? (data.avg_confidence * 100).toFixed(1) : "0.0"}%
          </p>
        </div>

        {/* Avg Latency */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg AI Latency</h3>
          <p className="text-3xl font-bold text-gray-900">
            {data?.avg_latency ? data.avg_latency.toFixed(0) : "0"} <span className="text-lg font-normal text-gray-500">ms</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8">
        <h2 className="text-lg font-semibold mb-4">Welcome to ConvSearch.ai</h2>
        <p className="text-gray-600">
          Your RAG platform is live. Head over to the <b>Data & Ingestion</b> tab to upload your product catalog, 
          generate an <b>API Key</b>, and then test the AI semantic search in the <b>Search Playground</b>!
        </p>
      </div>
    </div>
  );
}
