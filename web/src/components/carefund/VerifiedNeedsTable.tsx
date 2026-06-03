"use client";

import { formatUsd } from "@/data/carefund";

export type VerifiedNeedDTO = {
  id: string;
  purpose: string;
  amount: number;
  amountRaised: number;
  donorCount: number;
  fundName: string;
  orgName: string;
  status: string;
};

export default function VerifiedNeedsTable({ needs }: { needs: VerifiedNeedDTO[] }) {
  if (needs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-slate-500 text-sm font-bold uppercase tracking-widest">
        No verified needs yet
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.02] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        <span className="col-span-4">Need & Program</span>
        <span className="col-span-3">Goal</span>
        <span className="col-span-3">Raised</span>
        <span className="col-span-2 text-right">Status</span>
      </div>
      {needs.map((need) => {
        const progress = Math.min(100, Math.round((need.amountRaised / (need.amount || 1)) * 100));
        return (
          <div
            key={need.id}
            className="grid grid-cols-12 items-center gap-3 border-b border-white/5 px-6 py-6 text-sm last:border-0 hover:bg-white/[0.01] transition-colors"
          >
            <div className="col-span-4">
              <p className="font-bold text-white leading-tight">{need.purpose}</p>
              <p className="mt-1 text-[10px] font-bold text-teal-400/80 uppercase tracking-widest">{need.fundName}</p>
              <p className="text-[9px] text-slate-500 uppercase mt-0.5">{need.orgName}</p>
            </div>
            <div className="col-span-3">
              <p className="font-black text-slate-300">{formatUsd(need.amount)}</p>
            </div>
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 max-w-[80px]">
                    <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-teal-400" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <p className="font-black text-white">{formatUsd(need.amountRaised)}</p>
              </div>
              <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">{progress}% Funded · {need.donorCount} Donors</p>
            </div>
            <div className="col-span-2 text-right">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                progress >= 100 ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20" :
                "bg-teal-400/10 text-teal-300 border border-teal-400/20"
              }`}>
                {progress >= 100 ? "Fully Funded" : "Sponsoring"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
