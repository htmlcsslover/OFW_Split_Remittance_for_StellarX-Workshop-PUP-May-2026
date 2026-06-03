import { formatUsd } from "@/data/carefund";
import Link from "next/link";
import type { Fund } from "@prisma/client";

export default function FundCard({ fund }: { fund: Fund }) {
  const progress = Math.min(100, Math.round((Number(fund.currentBalance) / Number(fund.targetAmount)) * 100));

  return (
    <Link
      href={`/funds/${fund.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:border-teal-500/40 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-teal-500/5 active:scale-[0.98]"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between mb-3">
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-400">{fund.category}</span>
            <span className="text-[10px] font-black text-teal-400">{progress}% Funded</span>
        </div>
        <h3 className="text-xl font-bold leading-tight text-white group-hover:text-teal-200 transition-colors">
          {fund.name}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">
          {fund.description}
        </p>
        <div className="mt-6 flex items-end justify-between border-t border-white/5 pt-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Raised</p>
            <p className="text-lg font-black text-white">{formatUsd(Number(fund.currentBalance))}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Goal</p>
            <p className="text-sm font-bold text-slate-300">{formatUsd(Number(fund.targetAmount))}</p>
          </div>
        </div>
      </div>
      <div className="relative h-2 w-full bg-white/5">
        <div
          className="h-full bg-teal-400 transition-all duration-1000 group-hover:bg-teal-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Link>
  );
}
