"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsd } from "@/data/carefund";
import { useNotifications } from "@/components/carefund/NotificationProvider";
import { useConfirmModal } from "@/components/carefund/ConfirmActionModal";

export type FundDTO = {
  id: string;
  name: string;
  category: string;
  description: string;
  targetAmount: number;
  status: string;
  createdAt: string;
  organization: {
    displayName: string | null;
  };
};

export default function AdminFundApprovalList({
  initialFunds,
}: {
  initialFunds: FundDTO[];
}) {
  const router = useRouter();
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});
  const { notify } = useNotifications();
  const { confirm, prompt } = useConfirmModal();

  async function approve(id: string) {
    confirm({
      title: "Authorize Impact Program",
      description: "By authorizing this program, you are making it live on the marketplace. Donors will be able to contribute Testnet USDC/XLM directly to the program budget.",
      confirmLabel: "Verify & Publish",
      onConfirm: async () => {
        setLoading((state) => ({ ...state, [id]: true }));
        setError((state) => ({ ...state, [id]: "" }));
        try {
          const res = await fetch(`/api/funds/${id}/approve`, {
            method: "POST",
          });
          if (res.ok) {
            setApproved((state) => ({ ...state, [id]: true }));
            notify({
              variant: "success",
              title: "Program Published",
              message: "The impact program is now live on the marketplace.",
            });
            router.refresh();
          } else {
            const data = await res.json();
            throw new Error(data.error || "Failed to approve fund.");
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Approval failed";
          console.error(msg);
          setError((state) => ({ ...state, [id]: msg }));
          notify({ variant: "error", title: "Approval Failed", message: msg });
        } finally {
          setLoading((state) => ({ ...state, [id]: false }));
        }
      }
    });
  }

  async function reject(id: string) {
    prompt({
      title: "Reject Impact Program",
      description: "Please provide a reason for the rejection. This will be shared with the creating organization.",
      placeholder: "e.g., Target budget exceeds authorized limits...",
      confirmLabel: "Reject Program",
      variant: "danger",
      onConfirm: async (reason) => {
        setLoading((state) => ({ ...state, [id]: true }));
        try {
          const res = await fetch(`/api/funds/${id}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
          });
          if (res.ok) {
            notify({
              variant: "info",
              title: "Program Rejected",
              message: "The impact program request has been rejected.",
            });
            router.refresh();
          } else {
            const data = await res.json();
            throw new Error(data.error || "Failed to reject.");
          }
        } catch (e: unknown) {
          notify({ variant: "error", title: "Action Failed", message: e instanceof Error ? e.message : "Error" });
        } finally {
          setLoading((state) => ({ ...state, [id]: false }));
        }
      }
    });
  }

  async function edit(fund: FundDTO) {
    prompt({
        title: "Edit Program Details",
        description: `Updating details for program: ${fund.name}`,
        placeholder: "Update program name...",
        confirmLabel: "Save Changes",
        onConfirm: async (name) => {
            setLoading((state) => ({ ...state, [fund.id]: true }));
            try {
              const res = await fetch(`/api/funds/${fund.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
              });
              if (res.ok) {
                notify({
                  variant: "success",
                  title: "Details Updated",
                  message: "The program name has been updated successfully.",
                });
                router.refresh();
              } else {
                const data = await res.json();
                throw new Error(data.error || "Failed to update.");
              }
            } catch (e: unknown) {
              notify({ variant: "error", title: "Update Failed", message: e instanceof Error ? e.message : "Error" });
            } finally {
              setLoading((state) => ({ ...state, [fund.id]: false }));
            }
        }
    });
  }

  if (initialFunds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <p className="text-slate-500">No new impact programs awaiting verification.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {initialFunds.map((fund) => (
        <article key={fund.id} className="rounded-lg border border-white/10 bg-white/[0.055] p-5 transition-all hover:bg-white/[0.075]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">{fund.id.slice(0, 8)}</span>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-400">{fund.category}</p>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white">{fund.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{fund.description}</p>
              <p className="mt-3 text-xs text-slate-500">Created by <span className="text-slate-300 font-medium">{fund.organization.displayName || "Unknown Org"}</span></p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-black text-white">{formatUsd(Number(fund.targetAmount))}</p>
              <div className="mt-1">
                {approved[fund.id] ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-400/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    VERIFIED
                  </span>
                ) : fund.status === "PENDING" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-400/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    AWAITING VERIFICATION
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-bold text-slate-400 border border-white/10">
                    {fund.status}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {fund.status === "PENDING" && !approved[fund.id] && (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => approve(fund.id)}
                disabled={loading[fund.id]}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-teal-300 px-6 py-3 text-sm font-black text-slate-950 transition-all hover:bg-teal-200 disabled:opacity-50"
              >
                Verify & Publish Program
              </button>
              <button
                onClick={() => reject(fund.id)}
                disabled={loading[fund.id]}
                className="rounded-md bg-rose-500/20 px-6 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/30 transition-all disabled:opacity-50"
              >
                Reject Program
              </button>
              <button
                onClick={() => edit(fund)}
                disabled={loading[fund.id]}
                className="rounded-md bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Edit Details
              </button>
            </div>
          )}
          
          {approved[fund.id] && (
            <div className="mt-5 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Program Published
              </div>
              <p className="mt-2 text-xs leading-relaxed opacity-90">
                The impact program has been verified and is now live on the marketplace.
              </p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
