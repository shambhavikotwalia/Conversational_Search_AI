"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

export default function ApiKeysPage() {
  const { organizationId, token } = useAuth();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    if (!organizationId || !token) return;
    try {
      const data = await apiFetch(`/v1/api-keys/?organization_id=${organizationId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setApiKeys(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [organizationId, token]);

  const generateKey = async () => {
    setGenerating(true);
    setNewKey(null);
    try {
      const data = await apiFetch("/v1/api-keys/", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          organization_id: organizationId,
          name: `Key-${new Date().toISOString().split('T')[0]}`
        })
      });
      setNewKey(data.key);
      fetchKeys();
    } catch (err) {
      console.error(err);
      alert("Failed to generate API Key");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl text-black">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">API Keys</h2>
          <p className="text-gray-500 text-sm mt-1">Manage the X-Site-Key headers required to query the AI Search endpoint.</p>
        </div>
        <button
          onClick={generateKey}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors disabled:bg-blue-400"
        >
          {generating ? "Generating..." : "+ Create New Key"}
        </button>
      </div>

      {newKey && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-bold mb-2">Save your new API Key!</h3>
          <p className="text-green-700 text-sm mb-3">This key will only be shown once. Please store it securely.</p>
          <div className="bg-white p-3 border border-green-300 rounded font-mono text-sm break-all select-all">
            {newKey}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Loading keys...</td></tr>
            ) : apiKeys.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No API keys found. Generate one above.</td></tr>
            ) : (
              apiKeys.map((key) => (
                <tr key={key.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key.name || "Default Key"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(key.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {key.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
