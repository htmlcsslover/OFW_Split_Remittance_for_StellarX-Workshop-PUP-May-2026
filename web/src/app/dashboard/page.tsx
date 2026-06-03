import Link from "next/link";
import CareFundPage from "@/components/carefund/CareFundPage";
import ActivityTable from "@/components/carefund/ActivityTable";
import MetricCard from "@/components/carefund/MetricCard";
import { formatUsd } from "@/data/carefund";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardHubPage() {
  const funds = await prisma.fund.findMany();
  const supportRequests = await prisma.supportRequest.findMany();
  const activities = await prisma.activityLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { fund: true }
  });

  const balance = funds.reduce((sum, fund) => sum + Number(fund.currentBalance), 0);
  const pending = supportRequests.filter((request) => request.status === "PENDING").length;

  const roles = [
    { name: "Donor", href: "/dashboard/donor", description: "Track your contributions and see your real-world impact." },
    { name: "Organization", href: "/dashboard/organization", description: "Manage impact programs and publish funding needs." },
    { name: "Administrator", href: "/dashboard/admin", description: "Oversee platform governance and verify disbursements." },
  ];

  return (
    <CareFundPage>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-400">
          Transparency Command Center
        </p>
        <h2 className="mt-2 text-4xl font-black text-white">
          Impact Dashboard
        </h2>
        <p className="mt-3 text-lg text-slate-400 max-w-2xl">
            Real-time oversight of the CareFund ecosystem. Monitor fund flows, pending approvals, and the immutable audit trail.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MetricCard 
            label="Total Ecosystem Balance" 
            value={formatUsd(balance)} 
            detail="Cumulative value across all verified social impact funds." 
        />
        <MetricCard
            label="Verification Queue"
            value={String(pending)}
            detail="Funding requests currently undergoing organizational audit."
        />
      </div>

      <div className="mt-16">
        <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-white/10" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Access Your Workspace</h3>
            <div className="h-px flex-1 bg-white/10" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <Link 
              key={role.name} 
              href={role.href}
              className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-teal-500/50 hover:bg-teal-500/[0.05] hover:shadow-xl hover:shadow-teal-500/5"
            >
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-teal-300">{role.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">{role.description}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-500 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                Open Workspace
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="absolute top-0 right-0 h-16 w-16 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]">
                  <svg className="h-full w-full p-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
          <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">System-Wide Activity</h3>
              <p className="mt-1 text-sm text-slate-500">The most recent operations across all modules.</p>
          </div>
          <Link href="/transparency" className="group flex items-center gap-2 text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors">
            View Full Ledger
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <ActivityTable activities={activities} />
      </section>
    </CareFundPage>
  );
}
