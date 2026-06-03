import Link from "next/link";
import CareFundPage from "@/components/carefund/CareFundPage";
import ActivityTable from "@/components/carefund/ActivityTable";
import ContributeForm from "@/components/carefund/ContributeForm";
import WalletGate from "@/components/carefund/WalletGate";
import { categoryLabels, formatUsd } from "@/data/carefund";
import { prisma } from "@/lib/db/prisma";

export default async function FundDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string; needId?: string }>;
}) {
  const { id } = await params;
  const { action, needId } = await searchParams;
  
  const fund = await prisma.fund.findUnique({
    where: { id },
    include: {
      organization: true,
      activityLogs: { orderBy: { createdAt: "desc" }, include: { fund: true } },
      supportRequests: { orderBy: { createdAt: "desc" } },
    }
  });

  if (!fund) {
    return (
      <CareFundPage>
        <div className="flex flex-col items-center justify-center p-20 text-center">
            <h2 className="text-3xl font-black text-white">Fund not found</h2>
            <p className="mt-2 text-slate-500 text-lg">The fund you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/funds" className="mt-8 rounded-md bg-teal-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-teal-300">
                Back to Marketplace
            </Link>
        </div>
      </CareFundPage>
    );
  }

  const fundActivity = fund.activityLogs;
  const allRequests = fund.supportRequests;
  
  // 1. Calculate Needs Metrics (Strictly check for NaN/null)
  const totalNeedsAmount = allRequests.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const totalNeedsRaised = allRequests.reduce((sum, r) => sum + Number(r.amountRaised ?? 0), 0);
  const remainingNeeds = Math.max(0, totalNeedsAmount - totalNeedsRaised);

  // 2. Filter Public Funding Queue
  // We show anything that is not fully funded and is in an active status
  const activeNeeds = allRequests.filter(req => {
    const amount = Number(req.amount ?? 0);
    const raised = Number(req.amountRaised ?? 0);
    const isFullyFunded = amount > 0 && raised >= amount;
    
    return !isFullyFunded && ["PENDING", "APPROVED", "PUBLISHED", "FUNDING"].includes(req.status);
  });

  const completedNeeds = allRequests.filter(req => {
    const amount = Number(req.amount ?? 0);
    const raised = Number(req.amountRaised ?? 0);
    return amount > 0 && raised >= amount;
  });

  // 3. Status Summary for Banner
  const verifiedCount = allRequests.filter(r => r.status === "APPROVED").length;
  const partiallyFundedCount = allRequests.filter(r => Number(r.amountRaised ?? 0) > 0 && Number(r.amountRaised ?? 0) < Number(r.amount ?? 0)).length;

  const remainingProgramGoal = Math.max(0, Number(fund.targetAmount ?? 0) - Number(fund.currentBalance ?? 0));

  return (
    <CareFundPage>
      <WalletGate>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="flex flex-col gap-8">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-400">
                      {categoryLabels[fund.category] || fund.category}
                  </p>
                  <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">{fund.name}</h2>
                  <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-sm font-bold text-slate-400">Verified Program by <span className="text-teal-200">{fund.organization.displayName}</span></p>
                  </div>
                  <p className="mt-8 text-lg leading-relaxed text-slate-300">{fund.description}</p>
                  
                  {/* Dual Path Entry Points */}
                  <div className="mt-12 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col justify-between">
                          <div>
                              <h4 className="text-lg font-bold text-white">Sponsor an Urgent Need</h4>
                              <p className="mt-2 text-sm text-slate-400">Directly fund a specific community requirement (e.g. medical fee, repair).</p>
                          </div>
                          <Link 
                              href="#funding-queue"
                              className="mt-6 w-full rounded-md bg-amber-400 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-amber-300 transition-colors"
                          >
                              Select a Need ↓
                          </Link>
                      </div>
                      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-6 flex flex-col justify-between">
                          <div>
                              <h4 className="text-lg font-bold text-white">Contribute to Program Fund</h4>
                              <p className="mt-2 text-sm text-slate-400">Make a broad donation to the program&apos;s general operating budget.</p>
                          </div>
                          <Link 
                              href={`/funds/${id}?action=contribute`}
                              className="mt-6 w-full rounded-md bg-teal-400 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-teal-300 transition-colors"
                          >
                              Contribute Now →
                          </Link>
                      </div>
                  </div>

                  {/* Global Program Metrics */}
                  <div className="mt-16">
                      <div className="flex items-center gap-2 mb-4">
                          <div className="h-px flex-1 bg-white/5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Program Metrics</span>
                          <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <div className="grid gap-6 rounded-lg border border-white/5 bg-white/[0.02] p-6 sm:grid-cols-3">
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Raised</p>
                              <p className="mt-2 text-2xl font-black text-white">{formatUsd(Number(fund.currentBalance ?? 0))}</p>
                              <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                  <div 
                                      className="h-full bg-teal-400" 
                                      style={{ width: `${Math.min(100, (Number(fund.currentBalance ?? 0) / Number(fund.targetAmount ?? 1)) * 100)}%` }} 
                                  />
                              </div>
                          </div>
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Still Needed</p>
                              <p className="mt-2 text-2xl font-black text-teal-300">{formatUsd(remainingProgramGoal)}</p>
                              <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Remaining Goal</p>
                          </div>
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Program Target</p>
                              <p className="mt-2 text-2xl font-black text-slate-300">{formatUsd(Number(fund.targetAmount ?? 0))}</p>
                              <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized Budget</p>
                          </div>
                      </div>
                  </div>

                  {/* Published Needs Tracking */}
                  <div className="mt-10">
                      <div className="flex items-center gap-2 mb-4">
                          <div className="h-px flex-1 bg-white/5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/70">Published Needs Tracking</span>
                          <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <div className="grid gap-6 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] p-6 sm:grid-cols-3 border-dashed">
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Published Needs</p>
                              <p className="mt-2 text-2xl font-black text-white">{formatUsd(totalNeedsAmount)}</p>
                              <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total itemized</p>
                          </div>
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Sponsored So Far</p>
                              <p className="mt-2 text-2xl font-black text-amber-400">{formatUsd(totalNeedsRaised)}</p>
                              <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                  <div 
                                      className="h-full bg-amber-400" 
                                      style={{ width: `${Math.min(100, totalNeedsAmount > 0 ? (totalNeedsRaised / totalNeedsAmount) * 100 : 0)}%` }} 
                                  />
                              </div>
                          </div>
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Remaining Needs</p>
                              <p className="mt-2 text-2xl font-black text-slate-300">{formatUsd(remainingNeeds)}</p>
                              <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unfunded Specifics</p>
                          </div>
                      </div>
                  </div>

                  {/* Funding Needs Overview Banner */}
                  <div className="mt-8 flex flex-wrap gap-4 px-6 py-4 rounded-lg bg-white/5 border border-white/5 items-center justify-between">
                      <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Impact Summary</p>
                      </div>
                      <div className="flex gap-6">
                          <div className="text-center">
                              <p className="text-xs font-black text-white">{verifiedCount}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase">Verified</p>
                          </div>
                          <div className="text-center">
                              <p className="text-xs font-black text-amber-400">{activeNeeds.length}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase">Open</p>
                          </div>
                          <div className="text-center">
                              <p className="text-xs font-black text-teal-400">{partiallyFundedCount}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase">Partial</p>
                          </div>
                          <div className="text-center">
                              <p className="text-xs font-black text-emerald-400">{completedNeeds.length}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase">Funded</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
                  <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-2xl font-black tracking-tight text-white">Transparency Ledger</h3>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">On-Chain Activity</span>
                  </div>
                  <ActivityTable activities={fundActivity} />
              </div>
          </section>

          <aside className="flex flex-col gap-8">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
              <h3 className="text-xl font-black tracking-tight text-white">Audit Specs</h3>
              <div className="mt-6 space-y-6">
                <div>
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500">Settlement Asset</dt>
                  <dd className="mt-1.5 flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-teal-400/20 flex items-center justify-center">
                          <span className="text-[10px] font-black text-teal-400">S</span>
                      </div>
                      <span className="font-bold text-white">USDC</span>
                      <span className="text-xs text-slate-500 font-medium">Stellar Testnet</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500">Program Status</dt>
                  <dd className="mt-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/10 px-2.5 py-1 text-xs font-black text-teal-300 border border-teal-400/20 uppercase tracking-widest">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                          {fund.status}
                      </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custodian Verification</dt>
                  <dd className="mt-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-black text-emerald-300 border border-emerald-400/20 uppercase tracking-widest">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          {fund.organization.verificationStatus}
                      </span>
                  </dd>
                </div>
              </div>
            </div>
            
            <div className="animate-in fade-in slide-in-from-right-4 duration-700">
              { (needId || action === "contribute") ? (
                  <ContributeForm
                      fundId={fund.id}
                      fundName={fund.name}
                      targetAmount={Number(fund.targetAmount ?? 0)}
                      currentBalance={Number(fund.currentBalance ?? 0)}
                      supportRequestId={needId}
                      supportRequests={allRequests.map(r => ({
                          id: r.id,
                          purpose: r.purpose,
                          amount: Number(r.amount ?? 0),
                          amountRaised: Number(r.amountRaised ?? 0)
                      }))}
                  />
              ) : (
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center shadow-xl">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ready to help?</p>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">Select a sponsorship path on the left to begin your contribution.</p>
                  </div>
              )}
            </div>

            <div id="funding-queue" className="rounded-xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl scroll-mt-24">
              <h3 className="text-xl font-black tracking-tight text-white">Public Funding Queue</h3>
              <div className="mt-6 space-y-4">
                {activeNeeds.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No funding needs currently accepting donations.</p>
                  </div>
                )}
                {activeNeeds.map((request) => {
                  const amount = Number(request.amount ?? 0);
                  const raised = Number(request.amountRaised ?? 0);
                  const progress = Math.min(100, Math.round((raised / (amount || 1)) * 100));
                  
                  const isPartiallyFunded = raised > 0 && raised < amount;
                  const statusLabel = request.status === "PENDING" ? "Awaiting Verification" : 
                                    isPartiallyFunded ? "Partially Funded" : "Open for Funding";

                  return (
                    <div key={request.id} className="group rounded-lg border border-white/5 bg-slate-950/40 p-5 transition-all hover:border-white/20 hover:bg-white/[0.02]">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                              <p className="text-sm font-bold text-white line-clamp-2 leading-snug">{request.purpose}</p>
                              <div className="mt-2 flex items-center gap-2">
                                  <span className={`h-1.5 w-1.5 rounded-full ${request.status === 'PENDING' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{statusLabel}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-xs font-black text-teal-300">{formatUsd(amount)}</p>
                              <p className="mt-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Target Need</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                          <div>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Raised</p>
                              <p className="text-[11px] font-black text-white">{formatUsd(raised)}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Remaining</p>
                              <p className="text-[11px] font-black text-amber-400">{formatUsd(Math.max(0, amount - raised))}</p>
                          </div>
                        </div>

                        <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                          <div 
                              className={`h-full transition-all duration-1000 ${isPartiallyFunded ? 'bg-teal-400' : 'bg-white/10'}`} 
                              style={{ width: `${progress}%` }} 
                          />
                        </div>
                        
                        <Link 
                          href={`/funds/${id}?needId=${request.id}`}
                          className="w-full py-2 rounded-md bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 hover:bg-teal-400 hover:text-slate-950 hover:border-teal-400 transition-all"
                        >
                          Sponsor This Need
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {completedNeeds.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-3">Recently Funded</p>
                      <div className="space-y-2">
                          {completedNeeds.slice(0, 3).map((request) => (
                              <div key={request.id} className="flex items-center justify-between px-3 py-2 rounded bg-emerald-400/5 border border-emerald-500/10 opacity-70">
                                  <p className="text-xs text-slate-300 truncate max-w-[180px] font-medium">{request.purpose}</p>
                                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Fully Funded</span>
                              </div>
                          ))}
                      </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </WalletGate>
    </CareFundPage>
  );
}
