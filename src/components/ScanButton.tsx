"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScanButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/job/${jobId}/scan`, {
        method: "POST"
      });
      if (!res.ok) {
        let msg = "Erreur lors de l'analyse";
        try {
          const data = await res.json();
          if (data.error) msg = data.error;
        } catch(e) {}
        throw new Error(msg);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button 
        onClick={handleScan}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {loading ? "Analyse en cours..." : "Lancer l'analyse des emails"}
      </button>
      {error && <p className="text-red-400 text-xs mt-2 font-medium bg-red-950/50 p-2 rounded-lg border border-red-900/50 max-w-xs text-right">{error}</p>}
    </div>
  );
}
