import type { ActivityLog } from "@prisma/client";

export default function ActivityTable({ activities }: { activities: (ActivityLog & { fund?: { name: string } | null })[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.055] p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-medium text-white">No activity yet</h3>
        <p className="mt-1 text-xs text-slate-500">Transactions and logs will appear here as they occur.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.055]">
      <div className="grid grid-cols-12 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <span className="col-span-4 lg:col-span-3">Activity & Details</span>
        <span className="col-span-3 hidden lg:block">Program</span>
        <span className="col-span-4 lg:col-span-3">Date & Verification</span>
        <span className="col-span-4 lg:col-span-3 text-right">Status</span>
      </div>
      {activities.map((log) => {
        const fundName = log.fund?.name || "Global";
        const action = log.action === "SUPPORT_APPROVED" ? "SUPPORT_VERIFIED" : log.action;
        const details = log.details.replace("approved for disbursement", "verified for public funding");
        const txHash = log.txHash;
        const createdAt = log.createdAt instanceof Date 
            ? log.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + log.createdAt.toLocaleDateString()
            : String(log.createdAt);

        return (
          <div
            key={log.id}
            className="grid grid-cols-12 gap-3 border-b border-white/5 px-4 py-4 text-sm last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            <div className="col-span-4 lg:col-span-3">
              <p className="font-semibold text-white tracking-tight">{action.replaceAll("_", " ")}</p>
              <p className="mt-1 text-xs text-slate-400 line-clamp-1" title={details}>{details}</p>
            </div>
            
            <div className="col-span-3 hidden lg:block self-center">
              <p className="text-slate-300 truncate">{fundName}</p>
            </div>

            <div className="col-span-4 lg:col-span-3 self-center">
              <p className="text-xs text-slate-500">{createdAt}</p>
              {txHash ? (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-400 hover:text-teal-300"
                >
                  Verify On Stellar →
                </a>
              ) : (
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-600">Internal Ledger</span>
              )}
            </div>

            <div className="col-span-4 lg:col-span-3 text-right self-center">
              <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                log.action.includes('CONTRIBUTION') ? 'bg-teal-400/10 text-teal-300 border border-teal-400/20' :
                log.action.includes('APPROVED') ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20' :
                'bg-white/5 text-slate-400 border border-white/10'
              }`}>
                {log.action === "CONTRIBUTION_RECEIVED" ? "Confirmed" : "Verified"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
