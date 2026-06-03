import { formatUsd } from "@/data/carefund";
import Link from "next/link";

export type SupportNeedDTO = {
  id: string;
  fundId: string;
  amount: number;
  amountRaised: number;
  donorCount: number;
  purpose: string;
  description: string;
  status: string;
  fund: {
    name: string;
    organizationName: string;
  };
};

export default function SupportNeedCard({ need }: { need: SupportNeedDTO }) {
  const amount = Number(need.amount ?? 0);
  const raised = Number(need.amountRaised ?? 0);
  const remaining = Math.max(0, amount - raised);
  const progress = Math.min(100, Math.round((raised / (amount || 1)) * 100));
  
  const isFullyRaised = amount > 0 && raised >= amount;
  const statusLabel = need.status === "PENDING" ? "Awaiting Verification" : 
                    isFullyRaised ? "Fully Funded" : "Open for Funding";

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-amber-500/[0.03] transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/[0.06] hover:shadow-2xl hover:shadow-amber-500/5">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between mb-3">
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-500 truncate max-w-[150px]">{need.fund.organizationName}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isFullyRaised ? 'text-emerald-400' : 'text-amber-400/80'}`}>
                {statusLabel}
            </span>
        </div>
        <h3 className="text-xl font-bold leading-tight text-white group-hover:text-amber-200 transition-colors">
          {need.purpose}
        </h3>
        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
          Part of: {need.fund.name}
        </p>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">
          {need.description}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Raised</p>
                <p className="text-sm font-bold text-white">{formatUsd(raised)}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Remaining</p>
                <p className={`text-sm font-bold ${isFullyRaised ? 'text-emerald-400' : 'text-amber-300'}`}>{formatUsd(remaining)}</p>
            </div>
        </div>
        
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Goal</p>
            <p className="text-lg font-black text-white">{formatUsd(amount)}</p>
            {need.donorCount > 0 && (
               <p className="text-[9px] text-amber-200/50 mt-1 uppercase font-bold tracking-tighter">{need.donorCount} Sponsoring Donors</p>
            )}
          </div>
          <Link 
            href={`/funds/${need.fundId}?needId=${need.id}`}
            className={`rounded-md px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                isFullyRaised 
                ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-emerald-500/10' 
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/10'
            }`}
          >
            {isFullyRaised ? 'View Impact' : 'Sponsor Need'}
          </Link>
        </div>
      </div>
      <div className="relative h-1.5 w-full bg-white/5">
        <div
          className={`h-full transition-all duration-1000 ${isFullyRaised ? 'bg-emerald-400' : 'bg-amber-400'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
