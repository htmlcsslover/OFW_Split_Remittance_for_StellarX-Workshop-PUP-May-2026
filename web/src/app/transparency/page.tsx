import ActivityTable from "@/components/carefund/ActivityTable";
import CareFundPage from "@/components/carefund/CareFundPage";
import WalletGate from "@/components/carefund/WalletGate";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function TransparencyPage() {
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { fund: true }
  });

  return (
    <CareFundPage>
      <WalletGate>
        <div className="mb-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-400">
            Transparency Ledger
          </p>
          <h2 className="mt-2 text-4xl font-black text-white">
            Real-time Proof of Impact
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-slate-400 leading-relaxed">
            The CareFund Ledger is an immutable record of trust. Every contribution, funding request, and payout is logged here and verified against the Stellar blockchain.
          </p>
        </div>
        
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Verified Activity</h3>
              <span className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-bold text-teal-300 border border-teal-400/20 uppercase tracking-widest">Live Ledger</span>
          </div>
          <ActivityTable activities={activities} />
        </section>
      </WalletGate>
    </CareFundPage>
  );
}
