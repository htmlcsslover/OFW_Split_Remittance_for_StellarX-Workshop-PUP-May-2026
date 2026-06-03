"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConfirmModal } from "@/components/carefund/ConfirmActionModal";
import { useNotifications } from "@/components/carefund/NotificationProvider";

const STEPS = [
  {
    title: "1. Manage Programs",
    description: "As an Organization, create programs and publish specific funding needs.",
    role: "ORGANIZATION",
    href: "/dashboard/organization",
  },
  {
    title: "2. Review & Verify",
    description: "As an Admin, audit the NGO's funding needs and authorize them for the public.",
    role: "ADMIN",
    href: "/dashboard/admin",
  },
  {
    title: "3. Sponsor Needs",
    description: "As a Donor, connect Freighter and sponsor a verified need with Testnet XLM.",
    role: "DONOR",
    href: "/funds",
  },
  {
    title: "4. Audit Trail",
    description: "View the immutable ledger. Every contribution and action is publicly traceable.",
    role: "PUBLIC",
    href: "/transparency",
  },
];

export default function DemoGuide() {
  const [isOpen, setIsOpen] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [resetting, setResetting] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { confirm } = useConfirmModal();
  const { notify } = useNotifications();

  useEffect(() => {
    const saved = localStorage.getItem("carefund_demo_guide_open");
    requestAnimationFrame(() => {
      if (saved !== null) {
        setIsOpen(saved === "true");
      }
      setInitialized(true);
    });
  }, []);

  const toggleOpen = (val: boolean) => {
    setIsOpen(val);
    localStorage.setItem("carefund_demo_guide_open", String(val));
  };

  const handleReset = async (mode: "empty" | "seed") => {
    confirm({
        title: "Environment Reset",
        description: `This will wipe current data and reset the platform to ${mode === 'seed' ? 'its initial demo state' : 'an empty marketplace'}. This action cannot be undone.`,
        confirmLabel: "Reset Database",
        variant: "danger",
        onConfirm: async () => {
            setResetting(true);
            try {
              const res = await fetch(`/api/demo/reset?mode=${mode}`, { method: "POST" });
              if (!res.ok) throw new Error("Reset failed");
              
              notify({
                variant: "success",
                title: "Environment Reset",
                message: `Database successfully reset to ${mode} state.`,
              });

              router.push("/");
              router.refresh();
            } catch (e) {
              notify({
                variant: "error",
                title: "Reset Failed",
                message: e instanceof Error ? e.message : "Unknown error",
              });
            } finally {
              setResetting(false);
            }
        }
    });
  };

  if (!initialized) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => toggleOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-teal-400 text-slate-950 shadow-lg hover:bg-teal-300 transition-all active:scale-95"
      >
        <span className="text-xl font-bold">?</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-85 rounded-xl border border-teal-500/30 bg-slate-900/98 p-5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-teal-300">CareFund Demo Guide</h3>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">The Transparency Path</p>
        </div>
        <button onClick={() => toggleOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mt-4 space-y-2">
        {STEPS.map((step, i) => {
          const isActive = pathname === step.href || (step.href !== "/" && pathname.startsWith(step.href));
          return (
            <Link
              key={i}
              href={step.href}
              className={`block rounded-lg border p-3 transition-all duration-200 ${
                isActive
                  ? "border-teal-400/50 bg-teal-400/10 scale-[1.02] shadow-lg shadow-teal-500/5"
                  : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                  isActive ? "bg-teal-400 text-slate-950" : "bg-white/10 text-slate-400"
                }`}>
                  {i + 1}
                </span>
                <div>
                  <h4 className={`text-sm font-bold ${isActive ? "text-teal-200" : "text-white"}`}>
                    {step.title}
                  </h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-black">Environment Control</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
            <button
                disabled={resetting}
                onClick={() => handleReset("empty")}
                className="rounded bg-rose-500/10 border border-rose-500/20 py-2 text-[9px] font-black uppercase text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
                {resetting ? "Resetting..." : "Wipe Data"}
            </button>
            <button
                disabled={resetting}
                onClick={() => handleReset("seed")}
                className="rounded bg-teal-500/10 border border-teal-500/20 py-2 text-[9px] font-black uppercase text-teal-400 hover:bg-teal-500/20 transition-colors disabled:opacity-50"
            >
                {resetting ? "Resetting..." : "Re-Seed Demo"}
            </button>
        </div>
      </div>
    </div>
  );
}
