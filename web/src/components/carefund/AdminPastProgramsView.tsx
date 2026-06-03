"use client";

import { formatUsd } from "@/data/carefund";
import { FundDTO } from "./AdminFundApprovalList";

export type PastSupportRequestDTO = {
    id: string;
    purpose: string;
    amount: number;
    amountRaised: number;
    fundName: string;
    status: string;
    rejectionReason?: string | null;
    createdAt: string;
};

export default function AdminPastProgramsView({
  pastFunds,
  pastNeeds,
}: {
  pastFunds: (FundDTO & { currentBalance: number; rejectionReason?: string | null })[];
  pastNeeds: PastSupportRequestDTO[];
}) {
  return (
    <div className="grid gap-12">
        <section>
            <div className="mb-6 border-b border-white/5 pb-4">
                <h4 className="text-lg font-bold text-white uppercase tracking-wider">Past Impact Programs</h4>
            </div>
            {pastFunds.length === 0 ? (
                <p className="text-slate-500 text-center py-8 bg-white/5 rounded-lg">No past programs found.</p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                    <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.02] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <span className="col-span-5">Impact Program</span>
                        <span className="col-span-2 text-center">Status</span>
                        <span className="col-span-2 text-right">Target</span>
                        <span className="col-span-3 text-right">Total Funding</span>
                    </div>
                    {pastFunds.map((fund) => (
                        <div
                            key={fund.id}
                            className="grid grid-cols-12 items-center gap-3 border-b border-white/5 px-6 py-6 text-sm last:border-0 hover:bg-white/[0.01] transition-colors"
                        >
                            <div className="col-span-5">
                                <p className="font-bold text-white">{fund.name}</p>
                                <p className="mt-1 text-xs text-slate-500">{fund.category} · Created {new Date(fund.createdAt).toLocaleDateString()}</p>
                                {fund.rejectionReason && (
                                    <p className="mt-2 text-[10px] text-rose-400 font-medium italic">Reason: {fund.rejectionReason}</p>
                                )}
                            </div>
                            <div className="col-span-2 text-center">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border border-white/5 ${
                                    fund.status === 'ARCHIVED' ? 'bg-slate-800 text-slate-400' : 'bg-rose-900/40 text-rose-400'
                                }`}>
                                    {fund.status}
                                </span>
                            </div>
                            <p className="col-span-2 text-right font-medium text-slate-500">
                                {formatUsd(Number(fund.targetAmount))}
                            </p>
                            <div className="col-span-3 text-right">
                                <p className="font-black text-teal-400">{formatUsd(Number(fund.currentBalance))}</p>
                                <div className="mt-1.5 h-1 w-full bg-white/5 rounded-full overflow-hidden ml-auto max-w-[100px]">
                                    <div 
                                        className="h-full bg-teal-500" 
                                        style={{ width: `${Math.min(100, (fund.currentBalance / (fund.targetAmount || 1)) * 100)}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

        <section>
            <div className="mb-6 border-b border-white/5 pb-4">
                <h4 className="text-lg font-bold text-white uppercase tracking-wider">Past Funding Requests</h4>
            </div>
            {pastNeeds.length === 0 ? (
                <p className="text-slate-500 text-center py-8 bg-white/5 rounded-lg">No past funding requests found.</p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                    <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.02] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <span className="col-span-5">Funding Purpose</span>
                        <span className="col-span-2 text-center">Status</span>
                        <span className="col-span-2 text-right">Requested</span>
                        <span className="col-span-3 text-right">Sponsored</span>
                    </div>
                    {pastNeeds.map((need) => (
                        <div
                            key={need.id}
                            className="grid grid-cols-12 items-center gap-3 border-b border-white/5 px-6 py-6 text-sm last:border-0 hover:bg-white/[0.01] transition-colors"
                        >
                            <div className="col-span-5">
                                <p className="font-bold text-white">{need.purpose}</p>
                                <p className="mt-1 text-[10px] text-amber-400 font-bold uppercase tracking-widest">{need.fundName}</p>
                                <p className="mt-1 text-xs text-slate-500">Created {new Date(need.createdAt).toLocaleDateString()}</p>
                                {need.rejectionReason && (
                                    <p className="mt-2 text-[10px] text-rose-400 font-medium italic">Reason: {need.rejectionReason}</p>
                                )}
                            </div>
                            <div className="col-span-2 text-center">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border border-white/5 ${
                                    need.status === 'ARCHIVED' ? 'bg-slate-800 text-slate-400' : 'bg-rose-900/40 text-rose-400'
                                }`}>
                                    {need.status}
                                </span>
                            </div>
                            <p className="col-span-2 text-right font-medium text-slate-500">
                                {formatUsd(Number(need.amount))}
                            </p>
                            <div className="col-span-3 text-right">
                                <p className="font-black text-amber-400">{formatUsd(Number(need.amountRaised))}</p>
                                <div className="mt-1.5 h-1 w-full bg-white/5 rounded-full overflow-hidden ml-auto max-w-[100px]">
                                    <div 
                                        className="h-full bg-amber-500" 
                                        style={{ width: `${Math.min(100, (need.amountRaised / (need.amount || 1)) * 100)}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    </div>
  );
}
