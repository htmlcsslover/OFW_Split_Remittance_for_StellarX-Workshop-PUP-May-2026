import CareFundPage from "@/components/carefund/CareFundPage";
import MetricCard from "@/components/carefund/MetricCard";
import { formatUsd } from "@/data/carefund";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DonorDashboardPage() {
  const allContributions = await prisma.contribution.findMany({
    include: { 
      fund: true,
      supportRequest: true
    },
    orderBy: { createdAt: "desc" }
  });

  const totalDonated = allContributions.reduce((sum, c) => sum + Number(c.amount), 0);
  const uniqueDonorsCount = new Set(allContributions.map(c => c.walletAddress)).size;

  return (
    <CareFundPage>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-400">
          Donor Impact Portal
        </p>
        <h2 className="mt-2 text-4xl font-black text-white">
          Transparency Leaderboard
        </h2>
        <p className="mt-3 text-lg text-slate-400 max-w-2xl">
          A platform-wide view of every commitment made to social change. Verifiable in real-time on the Stellar ledger.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MetricCard label="Global Impact Commitment" value={formatUsd(totalDonated)} detail="Cumulative USDC contributed by the community." />
        <MetricCard label="Active Contributors" value={String(uniqueDonorsCount)} detail="Unique Stellar wallets that have backed programs." />
      </div>

      <section className="mt-16">
        <div className="mb-8 border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black tracking-tight text-white">All Contributions</h3>
            <p className="mt-1 text-sm text-slate-500">Live audit of donor wallets and their target impact programs.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.02] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <span className="col-span-4">Donor Wallet</span>
            <span className="col-span-3">Impact Target</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-3 text-right">Amount</span>
          </div>
          {allContributions.map((contribution) => (
            <div
              key={contribution.id}
              className="grid grid-cols-12 items-center gap-3 border-b border-white/5 px-6 py-6 text-sm last:border-0 hover:bg-white/[0.01] transition-colors"
            >
              <div className="col-span-4 flex flex-col gap-1">
                <span className="font-mono text-xs text-white truncate max-w-[150px]">{contribution.walletAddress}</span>
                {contribution.txHash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${contribution.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-teal-400 hover:text-teal-300"
                  >
                    Verify On Stellar →
                  </a>
                )}
              </div>
              <div className="col-span-3">
                <Link href={`/funds/${contribution.fundId}`} className="font-bold text-white hover:text-teal-300 transition-colors line-clamp-1">
                  {contribution.fund.name}
                </Link>
                {contribution.supportRequest && (
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-tight mt-0.5 line-clamp-1">
                        Need: {contribution.supportRequest.purpose}
                    </p>
                )}
              </div>
              <p className="col-span-2 font-medium text-slate-500">
                {contribution.createdAt.toLocaleDateString()}
              </p>
              <p className="col-span-3 text-right font-black text-teal-300 text-base">
                {formatUsd(Number(contribution.amount))}
              </p>
            </div>
          ))}
          {allContributions.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No contributions yet</p>
              <Link href="/funds" className="mt-4 inline-block text-teal-400 text-sm font-bold hover:underline underline-offset-4">Be the first to contribute →</Link>
            </div>
          )}
        </div>
      </section>
    </CareFundPage>
  );
}
