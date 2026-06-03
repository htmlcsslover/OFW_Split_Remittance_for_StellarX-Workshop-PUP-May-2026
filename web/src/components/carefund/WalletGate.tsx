"use client";

import { ReactNode, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useNotifications } from "@/components/carefund/NotificationProvider";

export default function WalletGate({ children }: { children: ReactNode }) {
  const { publicKey, connect, connecting, error } = useWallet();
  const { notify } = useNotifications();

  useEffect(() => {
    if (!publicKey && !connecting) {
        notify({
            variant: "warning",
            title: "Access Restricted",
            message: "This zone requires a connected Stellar wallet.",
        });
    }
  }, [publicKey, connecting, notify]);

  if (publicKey) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-400/10 text-teal-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white">Connect a wallet first</h2>
          <p className="mt-3 text-sm text-slate-400">
            Please connect Freighter to access funds, urgent needs, transparency, and contribution features.
          </p>
        </div>

        <button
          onClick={connect}
          disabled={connecting}
          className="w-full rounded-lg bg-teal-400 py-4 text-sm font-black text-slate-950 transition-all hover:bg-teal-300 active:scale-[0.98] disabled:opacity-50"
        >
          {connecting ? "Connecting..." : "Connect Freighter"}
        </button>

        {error && (
          <p className="mt-4 text-sm font-bold text-rose-400">{error}</p>
        )}
        
        <p className="mt-8 text-xs text-slate-500">
          A secure connection is required to interact with the Stellar blockchain and verify impact metrics.
        </p>
      </div>
    </div>
  );
}
