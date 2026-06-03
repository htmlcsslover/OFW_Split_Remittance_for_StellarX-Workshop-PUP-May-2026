import CareFundPage from "@/components/carefund/CareFundPage";
import AdminApprovalList, { type SupportRequestDTO } from "@/components/carefund/AdminApprovalList";
import AdminFundApprovalList, { type FundDTO } from "@/components/carefund/AdminFundApprovalList";
import AdminProgramManager from "@/components/carefund/AdminProgramManager";
import AdminFundingManager from "@/components/carefund/AdminFundingManager";
import AdminPastProgramsView, { type PastSupportRequestDTO } from "@/components/carefund/AdminPastProgramsView";
import WalletGate from "@/components/carefund/WalletGate";
import AdminAuth from "@/components/carefund/AdminAuth";
import MetricCard from "@/components/carefund/MetricCard";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const allSupportRequests = await prisma.supportRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { fund: { include: { organization: true } }, requester: true }
  });

  const allFunds = await prisma.fund.findMany({
    include: { organization: true },
    orderBy: { createdAt: "desc" }
  });

  const pendingFunds = allFunds.filter(f => f.status === "PENDING");
  const manageableFunds = allFunds.filter(f => f.status === "ACTIVE" || f.status === "COMPLETED" || f.status === "CLOSED");
  const pastFunds = allFunds.filter(f => f.status === "ARCHIVED" || f.status === "REJECTED" || f.status === "CLOSED");

  const pendingRequests = allSupportRequests.filter(r => r.status === "PENDING");
  const manageableRequests = allSupportRequests.filter(r => r.status === "APPROVED" || r.status === "FUNDED");
  const pastRequests = allSupportRequests.filter(r => r.status === "ARCHIVED" || r.status === "REJECTED" || r.status === "PAID");

  const usersCount = await prisma.user.count();
  const activeFundsCount = allFunds.filter(f => f.status === "ACTIVE").length;
  
  // Serialize Decimal and Date objects for Client Component
  const serializedPendingRequests: SupportRequestDTO[] = pendingRequests.map((r) => ({
    id: r.id,
    fundId: r.fundId,
    requesterId: r.requesterId,
    amount: Number(r.amount ?? 0),
    purpose: r.purpose,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    fund: { id: r.fund.id, name: r.fund.name },
    requester: { id: r.requester.id, displayName: r.requester.displayName },
  }));

  const serializedManageableRequests = manageableRequests.map((r) => ({
    id: r.id,
    purpose: r.purpose,
    amount: Number(r.amount ?? 0),
    amountRaised: Number(r.amountRaised ?? 0),
    donorCount: r.donorCount,
    fundName: r.fund.name,
    orgName: r.fund.organization.displayName,
    status: r.status
  }));

  const serializedPastRequests: PastSupportRequestDTO[] = pastRequests.map((r) => ({
    id: r.id,
    purpose: r.purpose,
    amount: Number(r.amount ?? 0),
    amountRaised: Number(r.amountRaised ?? 0),
    fundName: r.fund.name,
    status: r.status,
    rejectionReason: r.rejectionReason,
    createdAt: r.createdAt.toISOString(),
  }));

  const serializedPendingFunds: FundDTO[] = pendingFunds.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    description: f.description,
    targetAmount: Number(f.targetAmount),
    status: f.status,
    createdAt: f.createdAt.toISOString(),
    organization: { displayName: f.organization.displayName },
  }));

  const serializedManageableFunds: FundDTO[] = manageableFunds.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    description: f.description,
    targetAmount: Number(f.targetAmount),
    status: f.status,
    createdAt: f.createdAt.toISOString(),
    organization: { displayName: f.organization.displayName },
  }));

  const serializedPastFunds = pastFunds.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    description: f.description,
    targetAmount: Number(f.targetAmount),
    currentBalance: Number(f.currentBalance),
    status: f.status,
    rejectionReason: f.rejectionReason,
    createdAt: f.createdAt.toISOString(),
    organization: { displayName: f.organization.displayName },
  }));

  return (
    <CareFundPage>
      <WalletGate>
        <AdminAuth>
          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-400">
              Governance Dashboard
            </p>
            <h2 className="mt-2 text-4xl font-black text-white">
              Platform Oversight
            </h2>
            <p className="mt-3 text-lg text-slate-400 max-w-2xl">
                Audit ecosystem participants and authorize fund disbursements. Every approval here triggers a verifiable event on the Stellar ledger.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <MetricCard label="Participants" value={String(usersCount)} detail="NGOs & Donors." />
            <MetricCard label="Programs" value={String(activeFundsCount)} detail="Active programs." />
            <MetricCard label="Queue" value={String(pendingRequests.length + serializedPendingFunds.length)} detail="Awaiting audit." />
            <MetricCard label="Verified" value={String(manageableRequests.length)} detail="Needs published." />
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-2 border-b border-white/5 pb-16">
              <section>
                  <div className="mb-8 border-b border-white/5 pb-4">
                      <h3 className="text-2xl font-black tracking-tight text-white">Program Verification</h3>
                      <p className="mt-1 text-sm text-slate-500">Review and authorize new impact programs.</p>
                  </div>
                  <AdminFundApprovalList initialFunds={serializedPendingFunds} />
              </section>

              <section>
                  <div className="mb-8 border-b border-white/5 pb-4">
                      <h3 className="text-2xl font-black tracking-tight text-white">Program Management</h3>
                      <p className="mt-1 text-sm text-slate-500">Archive or edit active impact programs.</p>
                  </div>
                  <AdminProgramManager initialFunds={serializedManageableFunds} />
              </section>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-2 border-b border-white/5 pb-16">
              <section>
                  <div className="mb-8 border-b border-white/5 pb-4">
                      <h3 className="text-2xl font-black tracking-tight text-white">Funding Request Audit</h3>
                      <p className="mt-1 text-sm text-slate-500">Review individual funding requests.</p>
                  </div>
                  <AdminApprovalList initialRequests={serializedPendingRequests} />
              </section>

              <section>
                  <div className="mb-8 border-b border-white/5 pb-4">
                      <h3 className="text-2xl font-black tracking-tight text-white">Funding Management</h3>
                      <p className="mt-1 text-sm text-slate-500">Archive or edit active community requirements.</p>
                  </div>
                  <AdminFundingManager needs={serializedManageableRequests} />
              </section>
          </div>

          <section className="mt-20">
            <div className="mb-8 border-b border-white/5 pb-4">
                <h3 className="text-2xl font-black tracking-tight text-white">Historical Ledger</h3>
                <p className="mt-1 text-sm text-slate-500">View of archived, rejected, and completed impact data.</p>
            </div>
            <AdminPastProgramsView pastFunds={serializedPastFunds} pastNeeds={serializedPastRequests} />
          </section>
        </AdminAuth>
      </WalletGate>
    </CareFundPage>
  );
}
