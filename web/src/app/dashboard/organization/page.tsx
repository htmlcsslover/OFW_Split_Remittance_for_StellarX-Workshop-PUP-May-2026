import CareFundPage from "@/components/carefund/CareFundPage";
import MetricCard from "@/components/carefund/MetricCard";
import ModuleForm from "@/components/carefund/ModuleForm";
import WalletGate from "@/components/carefund/WalletGate";
import { formatUsd } from "@/data/carefund";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrganizationDashboardPage() {
  const organization = await prisma.user.findFirst({
    where: { role: "ORGANIZATION" },
    include: {
      managedFunds: {
        include: {
          supportRequests: {
            orderBy: { createdAt: "desc" }
          },
          contributions: true
        }
      }
    }
  });

  if (!organization) {
    return (
      <CareFundPage>
        <div className="flex flex-col items-center justify-center p-20 text-center">
            <h2 className="text-2xl font-black text-white">No organization found</h2>
            <p className="mt-2 text-slate-500">Please seed the database to view demo data.</p>
        </div>
      </CareFundPage>
    );
  }

  const activeFunds = organization.managedFunds.filter(f => f.status === "ACTIVE").length;
  const totalRaised = organization.managedFunds.reduce((sum, f) => sum + Number(f.currentBalance ?? 0), 0);
  
  // Metric: Only truly PENDING requests count towards the audit queue
  const pendingRequestsCount = organization.managedFunds.reduce((sum, f) => 
    sum + f.supportRequests.filter(r => r.status === "PENDING").length, 0
  );

  // Filter: Only ACTIVE programs can receive support requests
  const serializedFunds = organization.managedFunds
    .filter(fund => fund.status === "ACTIVE")
    .map((fund) => ({
      id: fund.id,
      name: fund.name,
      category: fund.category,
    }));

  return (
    <CareFundPage>
      <WalletGate>
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-400">
              Organization Command
            </p>
            <h2 className="mt-2 text-4xl font-black text-white">
              {organization.displayName}
            </h2>
            <p className="mt-3 text-lg text-slate-400 max-w-2xl">
              Manage your social impact programs and audit community funding applications.
            </p>
          </div>
          <Link
            href="/create-fund"
            className="group inline-flex items-center gap-2 rounded-md bg-teal-400 px-6 py-4 text-sm font-black text-slate-950 transition-all hover:bg-teal-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Create New Program
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard label="Active Programs" value={String(activeFunds)} detail="Programs currently receiving contributions." />
          <MetricCard label="Total Resources" value={formatUsd(totalRaised)} detail="Cumulative USDC committed to your programs." />
          <MetricCard label="Awaiting Verification" value={String(pendingRequestsCount)} detail="Needs queued for internal/admin audit." />
        </div>

        <section className="mt-16">
          <div className="mb-8 border-b border-white/5 pb-4">
              <h3 className="text-2xl font-black tracking-tight text-white">Publish Funding Need</h3>
              <p className="mt-1 text-sm text-slate-500">Create a specific funding request under one of your managed programs.</p>
          </div>
          <ModuleForm funds={serializedFunds} />
        </section>

        <section className="mt-16">
          <div className="mb-8 border-b border-white/5 pb-4">
              <h3 className="text-2xl font-black tracking-tight text-white">Verification Queue</h3>
              <p className="mt-1 text-sm text-slate-500">Needs currently awaiting verification before being published to the marketplace.</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.02] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <span className="col-span-5">Funding Purpose</span>
              <span className="col-span-3">Impact Program</span>
              <span className="col-span-2">Amount</span>
              <span className="col-span-2 text-right">Status</span>
            </div>
            {organization.managedFunds.flatMap(f => f.supportRequests)
              .filter(r => r.status === "PENDING")
              .map((request) => (
              <div
                key={request.id}
                className="grid grid-cols-12 items-center gap-3 border-b border-white/5 px-6 py-6 text-sm last:border-0 hover:bg-white/[0.01] transition-colors"
              >
                <div className="col-span-5">
                  <p className="font-bold text-white">{request.purpose}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{request.createdAt.toLocaleDateString()}</p>
                </div>
                <p className="col-span-3 font-medium text-slate-400 truncate">
                  {organization.managedFunds.find(f => f.id === request.fundId)?.name}
                </p>
                <p className="col-span-2 text-teal-300 font-black">
                  {formatUsd(Number(request.amount ?? 0))}
                </p>
                <div className="col-span-2 text-right">
                  <span className="inline-flex rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 border border-amber-400/20">
                    PENDING
                  </span>
                </div>
              </div>
            ))}
            {organization.managedFunds.flatMap(f => f.supportRequests).filter(r => r.status === "PENDING").length === 0 && (
              <div className="p-12 text-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No needs awaiting verification</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8 border-b border-white/5 pb-4">
              <h3 className="text-2xl font-black tracking-tight text-white">Active Management</h3>
              <p className="mt-1 text-sm text-slate-500">Status and progress of your verified impact programs.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {organization.managedFunds.map((fund) => (
              <div key={fund.id} className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:border-teal-500/30">
                <div>
                    <div className="flex items-start justify-between">
                      <h4 className="text-xl font-bold text-white group-hover:text-teal-200 transition-colors">{fund.name}</h4>
                      <span className="rounded-full bg-teal-400/10 px-2 py-0.5 text-[10px] font-black text-teal-300 border border-teal-400/20 uppercase tracking-widest">{fund.status}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-2">{fund.description}</p>
                    
                    <div className="mt-8">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em]">
                          <span className="text-slate-500">Program Progress</span>
                          <span className="text-white">{formatUsd(Number(fund.currentBalance ?? 0))} / {formatUsd(Number(fund.targetAmount ?? 0))}</span>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div 
                          className="h-full rounded-full bg-teal-400 transition-all duration-1000" 
                          style={{ width: `${Math.min(100, Math.round((Number(fund.currentBalance ?? 0) / (Number(fund.targetAmount ?? 1))) * 100))}%` }} 
                          />
                      </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Link 
                    href={`/funds/${fund.id}`} 
                    className="flex-1 rounded-md border border-white/10 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
                  >
                    Public View
                  </Link>
                  <Link 
                    href="/dashboard/admin" 
                    className="flex-1 rounded-md bg-white/10 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-colors"
                  >
                    Audit Queue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </WalletGate>
    </CareFundPage>
  );
}
