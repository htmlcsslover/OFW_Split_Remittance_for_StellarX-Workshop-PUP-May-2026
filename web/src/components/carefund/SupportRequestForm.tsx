"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useNotifications } from "@/components/carefund/NotificationProvider";

export default function SupportRequestForm({
  fundId,
  fundName,
}: {
  fundId: string;
  fundName: string;
}) {
  const router = useRouter();
  const { publicKey, connect } = useWallet();
  const { notify } = useNotifications();
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      notify({
        variant: "warning",
        title: "Connection Required",
        message: "Please connect your Stellar wallet to submit a funding request.",
      });
      setErrorMsg("Connect a wallet first.");
      connect();
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundId,
          amount: Number(amount),
          purpose,
          description,
          requesterId: "demo-beneficiary",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request.");
      }

      notify({
        variant: "success",
        title: "Support Request Sent",
        message: `Your request for "${purpose}" has been recorded and is pending review.`,
      });
      setStatus("success");
      setTimeout(() => {
        router.refresh();
        setStatus("idle");
        setAmount("");
        setPurpose("");
        setDescription("");
      }, 3000);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Request failed");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Request Submitted!</h3>
        <p className="mt-2 text-sm text-emerald-300/80">
          Your request for {fundName} has been logged. 
          Organizations and Admins can now review it for verification.
        </p>
        <div className="mt-6 flex justify-center">
            <div className="h-1 w-24 rounded-full bg-emerald-500/20">
                <div className="h-1 w-1/2 rounded-full bg-emerald-400 animate-[loading_1.5s_ease-in-out_infinite]" />
            </div>
        </div>
        <style jsx>{`
            @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Request Funding</h3>
      </div>
      <p className="mt-2 text-xs text-amber-200/60 uppercase tracking-widest font-black">{fundName}</p>
      
      <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Amount Needed (USDC)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-slate-950 pl-7 pr-3 py-2.5 text-white focus:border-amber-400 focus:outline-none transition-colors"
                placeholder="0.00"
                required
                min="1"
                disabled={status === "submitting"}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Purpose</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="rounded-md border border-white/10 bg-slate-950 px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none transition-colors"
            placeholder="Short title for your request"
            required
            disabled={status === "submitting"}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Additional Context</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border border-white/10 bg-slate-950 px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none transition-colors"
            placeholder="Explain how this support will help you..."
            rows={3}
            disabled={status === "submitting"}
          />
        </div>
        
        <div className="pt-2">
            <button
            type="submit"
            disabled={status === "submitting"}
            className="group relative w-full overflow-hidden rounded-md bg-amber-400 px-4 py-4 text-sm font-black text-slate-950 transition-all hover:bg-amber-300 disabled:opacity-50 active:scale-[0.98]"
            >
            {status === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting Request...
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    Submit Support Request
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
            )}
            </button>
        </div>
      </form>
      {errorMsg && (
        <div className="mt-4 rounded-md border border-rose-500/20 bg-rose-500/10 p-3 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-bold text-rose-400 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMsg}
            </p>
        </div>
      )}
    </div>
  );
}
