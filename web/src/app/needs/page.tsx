import CareFundPage from "@/components/carefund/CareFundPage";
import SupportNeedCard, { type SupportNeedDTO } from "@/components/carefund/SupportNeedCard";
import WalletGate from "@/components/carefund/WalletGate";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function VerifiedNeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ fundId?: string }>;
}) {
  const { fundId } = await searchParams;

  // Fetch only APPROVED (Verified) requests that are not yet fully funded
  const supportRequests = await prisma.supportRequest.findMany({
    where: { 
        status: "APPROVED",
        fundId: fundId || undefined,
    },
    include: { fund: { include: { organization: true } } },
    orderBy: { createdAt: "desc" }
  });

  // Filter out fully funded ones in memory (or we could use a raw query if needed, but this is fine for MVP)
  const filteredRequests = supportRequests.filter(r => {
      const amount = Number(r.amount ?? 0);
      const raised = Number(r.amountRaised ?? 0);
      return amount > 0 && raised < amount;
  });

  const supportNeeds: SupportNeedDTO[] = filteredRequests.map(r => ({
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
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
            Verified Funding Needs
          </p>
          <h2 className="text-4xl font-black text-white">Direct Impact Opportunities</h2>
          <p className="max-w-2xl text-lg text-slate-400">
            Browse specific community requirements that have been vetted and verified by our partner organizations. Sponsor a need directly to see your impact in action.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {supportNeeds.map((need) => (
            <SupportNeedCard key={need.id} need={need} />
          ))}
        </div>

        {supportNeeds.length === 0 && (
          <div className="mt-12 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-20 text-center">
              <h3 className="text-xl font-bold text-white">No open needs found</h3>
              <p className="mt-2 text-slate-500">All currently verified funding requests have been fully sponsored.</p>
          </div>
        )}
      </WalletGate>
    </CareFundPage>
  );
}
