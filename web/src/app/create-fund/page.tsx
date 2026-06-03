"use client";

import { useState } from "react";
import CareFundPage from "@/components/carefund/CareFundPage";
import WalletGate from "@/components/carefund/WalletGate";
import { useWallet } from "@/hooks/useWallet";
import { useNotifications } from "@/components/carefund/NotificationProvider";
import { categoryLabels } from "@/data/carefund";

const categories = Object.entries(categoryLabels);

export default function CreateFundPage() {
  const { publicKey, connect } = useWallet();
  const { notify } = useNotifications();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    if (!publicKey) {
      notify({
        variant: "warning",
        title: "Connection Required",
        message: "Please connect your Stellar wallet to create a new program.",
      });
      setError("Connect a wallet first.");
      connect();
      return;
    }

    setLoading(true);
    setStatus("Creating program...");
    setError(null);

    const name = String(formData.get("name"));

    const payload = {
      name,
      category: formData.get("category"),
      description: formData.get("description"),
      targetAmount: Number(formData.get("targetAmount")),
      organizationId: "demo-ngo-id", // In production, from session
    };

    try {
      const res = await fetch("/api/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to create program");
      }

      notify({
        variant: "success",
        title: "Program Created",
        message: `Impact program "${name}" has been submitted for administrative verification.`,
      });
      setStatus("Program created and queued for verification");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An unexpected error occurred";
      notify({
        variant: "error",
        title: "Creation Failed",
        message: msg,
      });
      setError(msg);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CareFundPage>
      <WalletGate>
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
            Organization Portal
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Create Impact Program
          </h2>
          <form action={submit} className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-white/[0.055] p-5">
            <label className="grid gap-2 text-sm text-slate-300">
              Program Name
              <input 
                name="name" 
                required 
                disabled={loading}
                className="rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-white focus:border-teal-400 focus:outline-none" 
              />
            </label>
            
            <label className="grid gap-2 text-sm text-slate-300">
              Impact Category
              <select 
                name="category" 
                disabled={loading}
                className="rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-white focus:border-teal-400 focus:outline-none"
              >
                {categories.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Target Amount (USDC)
              <input 
                name="targetAmount" 
                type="number" 
                min="1" 
                defaultValue="10000" 
                required 
                disabled={loading}
                className="rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-white focus:border-teal-400 focus:outline-none" 
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Public Description
              <textarea 
                name="description" 
                rows={4} 
                required 
                disabled={loading}
                className="rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-white focus:border-teal-400 focus:outline-none" 
              />
            </label>

            <button 
              type="submit"
              disabled={loading}
              className="rounded-md bg-teal-300 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-teal-200 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Create Impact Program"}
            </button>
            
            {status && <p className="mt-2 text-sm text-emerald-400 font-medium">✓ {status}</p>}
            
            {error && (
              <div className="mt-2 rounded-md bg-rose-500/10 p-3 border border-rose-500/20">
                <p className="text-sm text-rose-400 font-medium flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
                {process.env.NODE_ENV === "development" && (
                  <pre className="mt-2 text-[10px] text-rose-400/70 overflow-auto bg-black/20 p-2 rounded">
                    {error}
                  </pre>
                )}
              </div>
            )}
          </form>
        </div>
      </WalletGate>
    </CareFundPage>
  );
}
