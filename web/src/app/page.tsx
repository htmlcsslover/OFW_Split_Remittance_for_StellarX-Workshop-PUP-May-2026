import Link from "next/link";
import CareFundPage from "@/components/carefund/CareFundPage";
import FundCard from "@/components/carefund/FundCard";
import MetricCard from "@/components/carefund/MetricCard";
import ActivityTable from "@/components/carefund/ActivityTable";
import { formatUsd } from "@/data/carefund";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const funds = await prisma.fund.findMany({ take: 4, orderBy: { createdAt: "desc" } });
  const activities = await prisma.activityLog.findMany({ 
    take: 5, 
    orderBy: { createdAt: "desc" }, 
    include: { fund: true } 
  });

  const totalBalance = funds.reduce((sum, fund) => sum + Number(fund.currentBalance), 0);
  const beneficiaries = 1764; // Concept count for demo

  return (
    <CareFundPage>
      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-200">
            Unified social impact funding
          </p>
          <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
            CareFund Stellar
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A transparent social impact funding platform powered by Stellar. 
            Enable donors to fund verified causes, beneficiaries to request funding, and organizations to distribute aid.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/funds"
              className="rounded-md bg-teal-300 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
            >
              Explore funds
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open dashboard
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          <MetricCard
            label="Public fund balance"
            value={formatUsd(totalBalance)}
            detail="USDC-first pools with XLM support for testnet MVP flows."
          />
          <MetricCard
            label="Unified Transparency"
            value="100%"
            detail="Every movement is traceable on the Stellar ledger."
          />
          <MetricCard
            label="Impact Categories"
            value="4"
            detail="Mental health, solar schools, senior stipends, and lunch funds."
          />
          <MetricCard
            label="Verified Beneficiaries"
            value={String(beneficiaries)}
            detail="Individuals and local communities supported by verified programs."
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
              Marketplace
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Active Impact Funds</h2>
          </div>
          <Link href="/funds" className="text-sm font-medium text-teal-100 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {funds.map((fund) => (
            <FundCard key={fund.id} fund={fund} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
            Public activity
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Immutable Audit Trail
          </h2>
        </div>
        <ActivityTable activities={activities} />
      </section>
    </CareFundPage>
  );
}
