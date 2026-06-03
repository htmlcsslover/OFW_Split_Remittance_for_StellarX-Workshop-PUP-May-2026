"use client";

import { useState, useEffect } from "react";

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsMounted(true);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password for demo purposes.
    if (password === "bayanfund2026") {
      setIsAuthenticated(true);
    } else {
      setError("Invalid administrative password.");
    }
  };

  if (!isMounted) {
    return null; // Avoid hydration flicker
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-400/10 text-teal-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white">Administrative Access</h2>
          <p className="mt-2 text-slate-400">Please enter the platform governance password to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Governance Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/50"
              placeholder="••••••••••••"
              autoFocus
            />
          </div>

          {error && <p className="text-sm font-bold text-rose-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-teal-400 py-4 text-sm font-black text-slate-950 transition-all hover:bg-teal-300 active:scale-[0.98]"
          >
            Authorize Access
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Authorized personnel only. All access attempts are logged on the immutable ledger.
        </p>
      </div>
    </div>
  );
}
