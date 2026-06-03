import CareFundPage from "@/components/carefund/CareFundPage";
import FundCard from "@/components/carefund/FundCard";
import SupportNeedCard, { type SupportNeedDTO } from "@/components/carefund/SupportNeedCard";
import WalletGate from "@/components/carefund/WalletGate";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function FundsPage() {
  const allFunds = await prisma.fund.findMany({
    where: { status: { in: ["ACTIVE", "COMPLETED", "CLOSED"] } },
    orderBy: { createdAt: "desc" }
  });

  const supportRequests = await prisma.supportRequest.findMany({
    where: { status: { in: ["APPROVED", "FUNDED", "PAID"] } },
    include: { fund: { include: { organization: true } } },
    orderBy: { createdAt: "desc" }
  });

  // Split Programs
  const activeFunds = allFunds.filter(f => {
      const isStatusActive = f.status === "ACTIVE";
      const isNotFull = Number(f.currentBalance ?? 0) < Number(f.targetAmount ?? 0);
      return isStatusActive && isNotFull;
  });

  const completedFunds = allFunds.filter(f => {
      const isStatusCompleted = f.status === "COMPLETED" || f.status === "CLOSED";
      const isFull = Number(f.currentBalance ?? 0) >= Number(f.targetAmount ?? 0);
      return isStatusCompleted || (f.status === "ACTIVE" && isFull);
  });

  // Split Needs
  const activeNeedsData = supportRequests.filter(r => {
      const amount = Number(r.amount ?? 0);
      const raised = Number(r.amountRaised ?? 0);
      return amount > 0 && raised < amount && r.status === "APPROVED";
  });

  const completedNeedsData = supportRequests.filter(r => {
      const amount = Number(r.amount ?? 0);
      const raised = Number(r.amountRaised ?? 0);
      return (amount > 0 && raised >= amount) || r.status === "FUNDED" || r.status === "PAID";
  });

  const supportNeeds: SupportNeedDTO[] = activeNeedsData.map(r => ({
    id: r.id,
    fundId: r.fundId,
    amount: Number(r.amount ?? 0),
    amountRaised: Number(r.amountRaised ?? 0),
    donorCount: r.donorCount,
    purpose: r.purpose,
    description: r.description,
    status: r.status,
    fund: {
      name: r.fund.name,
      organizationName: r.fund.organization.displayName,
    }
  }));

  const completedNeeds: SupportNeedDTO[] = completedNeedsData.map(r => ({
    id: r.id,
    fundId: r.fundId,
    amount: Number(r.amount ?? 0),
    amountRaised: Number(r.amountRaised ?? 0),
    donorCount: r.donorCount,
    purpose: r.purpose,
    description: r.description,
    status: r.status,
    fund: {
      name: r.fund.name,
      organizationName: r.fund.organization.displayName,
    }
  }));

  return (
    <CareFundPage>
      <WalletGate>
        <div className="mb-10 flex flex-col gap-3">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-400">
            Impact Marketplace
          </p>
          <h2 className="text-4xl font-black text-white">Active Social Impact Funds</h2>
          <p className="max-w-2xl text-lg text-slate-400">
            Directly fund verified programs across the Philippines. Each contribution is a direct, on-chain commitment to social good.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {activeFunds.map((fund) => (
            <FundCard key={fund.id} fund={fund} />
          ))}
        </div>
        
        {activeFunds.length === 0 && (
          <div className="mt-12 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-20 text-center">
              <h3 className="text-xl font-bold text-white">No active funds found</h3>
              <p className="mt-2 text-slate-500">Organizations are currently preparing new impact programs.</p>
          </div>
        )}

        <div className="mt-20 mb-10 flex flex-col gap-3">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
            Urgent Funding Requests
          </p>
          <h2 className="text-4xl font-black text-white">Open Support Needs</h2>
          <p className="max-w-2xl text-lg text-slate-400">
            Sponsor specific, verified needs within our impact funds. Direct aid for immediate community requirements.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {supportNeeds.map((need) => (
            <SupportNeedCard key={need.id} need={need} />
          ))}
        </div>

        {supportNeeds.length === 0 && (
          <div className="mt-12 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-20 text-center">
              <h3 className="text-xl font-bold text-white">No pending needs</h3>
              <p className="mt-2 text-slate-500">All current funding requests have been addressed or are under review.</p>
          </div>
        )}

        {(completedFunds.length > 0 || completedNeeds.length > 0) && (
          <>
            <div className="mt-32 mb-10 flex flex-col gap-3">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-400">
                Proof of Impact
              </p>
              <h2 className="text-4xl font-black text-white">Completed Fundings</h2>
              <p className="max-w-2xl text-lg text-slate-400">
                Verified impact programs and community needs that have reached their funding goals and are delivering social good.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {completedFunds.map((fund) => (
                <FundCard key={fund.id} fund={fund} />
              ))}
              {completedNeeds.map((need) => (
                <SupportNeedCard key={need.id} need={need} />
              ))}
            </div>
          </>
        )}
      </WalletGate>
    </CareFundPage>
  );
}
