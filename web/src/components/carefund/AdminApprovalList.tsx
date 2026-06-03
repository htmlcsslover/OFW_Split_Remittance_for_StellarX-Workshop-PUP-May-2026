"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsd } from "@/data/carefund";
import { useNotifications } from "@/components/carefund/NotificationProvider";
import { useConfirmModal } from "@/components/carefund/ConfirmActionModal";

export type SupportRequestDTO = {
  id: string;
  fundId: string;
  requesterId: string;
  amount: number;
  purpose: string;
  description: string | null;
  status: string;
  createdAt: string;
  fund: {
    id: string;
    name: string;
  };
  requester: {
    id: string;
    displayName: string | null;
  };
};

export default function AdminApprovalList({
  initialRequests,
}: {
  initialRequests: SupportRequestDTO[];
}) {
  const router = useRouter();
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});
  const { notify } = useNotifications();
  const { confirm, prompt } = useConfirmModal();

  async function approve(id: string) {
    confirm({
      title: "Confirm Payout Approval",
      description: "This will authorize the disbursement of funds to the beneficiary on the Stellar network. This action is irreversible.",
      confirmLabel: "Authorize Payout",
      onConfirm: async () => {
        setLoading((state) => ({ ...state, [id]: true }));
        setError((state) => ({ ...state, [id]: "" }));
        try {
          const res = await fetch("/api/approvals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              requestId: id, 
              approverId: "demo-admin", 
              notes: "Approved for payout via Stellar demo flow." 
            }),
          });
          if (res.ok) {
            setApproved((state) => ({ ...state, [id]: true }));
            notify({
              variant: "success",
              title: "Payout Authorized",
              message: "The funding request has been verified and authorized for settlement.",
            });
            router.refresh();
          } else {
            const data = await res.json();
            throw new Error(data.error || "Failed to approve payout.");
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Approval failed";
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
      title: "Reject Funding Request",
      description: "Please provide a clear reason for the rejection. This will be visible to the organization and the beneficiary.",
      placeholder: "e.g., Missing documentation for medical fee...",
      confirmLabel: "Reject Request",
      variant: "danger",
      onConfirm: async (reason) => {
        setLoading((state) => ({ ...state, [id]: true }));
        try {
          const res = await fetch(`/api/support-requests/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reject", reason }),
          });
          if (res.ok) {
            notify({
              variant: "info",
              title: "Request Rejected",
              message: "The funding request has been removed from the queue.",
            });
            router.refresh();
          } else {
            const data = await res.json();
            throw new Error(data.error || "Failed to reject.");
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Rejection failed";
          setError((state) => ({ ...state, [id]: msg }));
          notify({ variant: "error", title: "Action Failed", message: msg });
        } finally {
          setLoading((state) => ({ ...state, [id]: false }));
        }
      }
    });
  }

  async function edit(request: SupportRequestDTO) {
    prompt({
        title: "Edit Request Purpose",
        description: `Updating details for request ${request.id.slice(0, 8)}. Current purpose: ${request.purpose}`,
        placeholder: "New purpose...",
        confirmLabel: "Update Request",
        onConfirm: async (purpose) => {
            setLoading((state) => ({ ...state, [request.id]: true }));
            try {
              const res = await fetch(`/api/support-requests/${request.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ purpose }),
              });
              if (res.ok) {
                notify({
                  variant: "success",
                  title: "Details Updated",
                  message: "The funding request details have been synchronized.",
                });
                router.refresh();
              } else {
                const data = await res.json();
                throw new Error(data.error || "Failed to update.");
              }
            } catch (e: unknown) {
              notify({ variant: "error", title: "Update Failed", message: e instanceof Error ? e.message : "Error" });
            } finally {
              setLoading((state) => ({ ...state, [request.id]: false }));
            }
        }
    });
  }

  if (initialRequests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <p className="text-slate-500">No funding requests awaiting approval.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {initialRequests.map((request) => (
        <article key={request.id} className="rounded-lg border border-white/10 bg-white/[0.055] p-5 transition-all hover:bg-white/[0.075]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">{request.id.slice(0, 8)}</span>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-400">{request.fund.name}</p>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white">{request.purpose}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{request.description || "No additional details provided."}</p>
              <p className="mt-3 text-xs text-slate-500">Requested by <span className="text-slate-300 font-medium">{request.requester.displayName || "Anonymous Beneficiary"}</span></p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-black text-white">{formatUsd(Number(request.amount))}</p>
              <div className="mt-1">
                {approved[request.id] ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-400/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    APPROVED
                  </span>
                ) : request.status === "PENDING" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-400/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    PENDING REVIEW
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-bold text-slate-400 border border-white/10">
                    {request.status}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {request.status === "PENDING" && !approved[request.id] && (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => approve(request.id)}
                disabled={loading[request.id]}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-teal-300 px-6 py-3 text-sm font-black text-slate-950 transition-all hover:bg-teal-200 disabled:opacity-50"
              >
                Verify & Approve Payout
              </button>
              <button
                onClick={() => reject(request.id)}
                disabled={loading[request.id]}
                className="rounded-md bg-rose-500/20 px-6 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/30 transition-all disabled:opacity-50"
              >
                Reject Request
              </button>
              <button
                onClick={() => edit(request)}
                disabled={loading[request.id]}
                className="rounded-md bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Edit Details
              </button>
              {error[request.id] && <p className="w-full mt-3 text-xs font-bold text-rose-400">{error[request.id]}</p>}
            </div>
          )}
          
          {approved[request.id] && (
            <div className="mt-5 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Payout Verified
              </div>
              <p className="mt-2 text-xs leading-relaxed opacity-90">
                The disbursement has been authorized and recorded on the internal ledger. 
                The transaction is now queued for broadcast to the Stellar network.
              </p>
              <div className="mt-3 flex gap-4">
                  <div className="h-1 w-full rounded-full bg-emerald-500/20">
                      <div className="h-1 w-2/3 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
