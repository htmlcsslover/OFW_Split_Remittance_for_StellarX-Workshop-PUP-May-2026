import CareFundPage from "@/components/carefund/CareFundPage";
import MetricCard from "@/components/carefund/MetricCard";
import { formatUsd } from "@/data/carefund";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BeneficiaryDashboardPage() {
  const beneficiary = await prisma.user.findFirst({
    where: { role: "BENEFICIARY" },
    include: {
      supportRequests: {
        include: { fund: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!beneficiary) {
    return (
      <CareFundPage>
        <div className="flex flex-col items-center justify-center p-20 text-center">
            <h2 className="text-2xl font-black text-white">No beneficiary found</h2>
            <p className="mt-2 text-slate-500">Please seed the database to view demo data.</p>
        </div>
      </CareFundPage>
    );
  }

  const pendingRequests = beneficiary.supportRequests.filter(r => r.status === "PENDING").length;
  const approvedAmount = beneficiary.supportRequests
    .filter(r => r.status === "APPROVED" || r.status === "PAID")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <CareFundPage>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-400">
            Beneficiary Workspace
          </p>
          <h2 className="mt-2 text-4xl font-black text-white">
            Hello, {beneficiary.displayName}
          </h2>
          <p className="mt-3 text-lg text-slate-400 max-w-2xl">
            Monitor your funding requests and track authorized aid disbursements.
          </p>
        </div>
        <Link
          href="/funds"
          className="group inline-flex items-center gap-2 rounded-md bg-teal-400 px-6 py-4 text-sm font-black text-slate-950 transition-all hover:bg-teal-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          New Funding Request
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MetricCard label="Active Requests" value={String(pendingRequests)} detail="Funding requests currently undergoing organizational audit." />
        <MetricCard label="Funding Authorized" value={formatUsd(approvedAmount)} detail="Total value of aid approved for disbursement." />
      </div>

      <section className="mt-16">
        <div className="mb-8 border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black tracking-tight text-white">Request History</h3>
            <p className="mt-1 text-sm text-slate-500">Track the status of your funding requests on the internal ledger.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.02] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <span className="col-span-5">Purpose & Date</span>
            <span className="col-span-3">Fund Pool</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Amount</span>
          </div>
          {beneficiary.supportRequests.map((request) => (
            <div
              key={request.id}
              className="grid grid-cols-12 items-center gap-3 border-b border-white/5 px-6 py-6 text-sm last:border-0 hover:bg-white/[0.01] transition-colors"
            >
              <div className="col-span-5">
                <p className="font-bold text-white">{request.purpose}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{request.createdAt.toLocaleDateString()} · {request.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <p className="col-span-3 font-medium text-slate-400 truncate">{request.fund.name}</p>
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                  request.status === "PENDING" ? "bg-amber-400/10 text-amber-300 border border-amber-400/20" :
                  request.status === "APPROVED" ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20" :
                  request.status === "PAID" ? "bg-teal-400/10 text-teal-300 border border-teal-400/20" :
                  "bg-rose-400/10 text-rose-300 border border-rose-400/20"
                }`}>
                  {request.status === "PENDING" && <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />}
                  {request.status}
                </span>
              </div>
              <p className="col-span-2 text-right font-black text-teal-300">
                {formatUsd(Number(request.amount))}
              </p>
            </div>
          ))}
          {beneficiary.supportRequests.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No requests found</p>
              <Link href="/funds" className="mt-4 inline-block text-teal-400 text-sm font-bold hover:underline underline-offset-4">Browse funds to start →</Link>
            </div>
          )}
        </div>
      </section>
    </CareFundPage>
  );
}
