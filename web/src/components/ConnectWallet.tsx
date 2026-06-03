'use client';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';

export default function ConnectWallet() {
  const { publicKey, connecting, error, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (publicKey) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            title="Copy full address"
            className="rounded-md border border-white/10 bg-white/10 px-3 py-2 font-mono text-sm text-slate-100 transition-colors hover:bg-white/15"
          >
            {copied ? 'Copied!' : `${publicKey.slice(0, 6)}…${publicKey.slice(-6)}`}
          </button>
          <button
            onClick={disconnect}
            className="text-sm text-rose-200 hover:underline"
          >
            Disconnect
          </button>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-teal-300">
          <span>Need Testnet XLM?</span>
          <a
            href={`https://friendbot.stellar.org/?addr=${publicKey}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-teal-400/10 px-2 py-0.5 font-bold hover:bg-teal-400/20"
          >
            Friendbot →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <button
        onClick={connect}
        disabled={connecting}
        className="rounded-md bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 disabled:opacity-50"
      >
        {connecting ? 'Connecting…' : 'Connect Freighter'}
      </button>
      {error && <p className="mt-2 max-w-xs text-sm text-rose-200">{error}</p>}
    </div>
  );
}
