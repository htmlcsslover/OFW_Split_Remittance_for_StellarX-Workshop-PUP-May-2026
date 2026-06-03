"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsd } from "@/data/carefund";
import { useNotifications } from "@/components/carefund/NotificationProvider";
import { useConfirmModal } from "@/components/carefund/ConfirmActionModal";

export type SupportNeedDTO = {
  id: string;
  purpose: string;
  amount: number;
  amountRaised: number;
  donorCount: number;
  fundName: string;
  orgName: string;
  status: string;
};

export default function AdminFundingManager({
  needs,
}: {
  needs: SupportNeedDTO[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(needs);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { notify } = useNotifications();
  const { confirm, prompt } = useConfirmModal();

  async function archive(id: string) {
    confirm({
      title: "Archive Funding Request",
      description: "Are you sure you want to archive this funding request? It will no longer be visible on the public marketplace.",
      confirmLabel: "Archive Request",
      variant: "danger",
      onConfirm: async () => {
        setLoading((state) => ({ ...state, [id]: true }));
        try {
          const res = await fetch(`/api/support-requests/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "archive" }),
          });
          if (res.ok) {
            setItems((state) => state.filter(i => i.id !== id));
            notify({
              variant: "info",
              title: "Request Archived",
              message: "The funding request has been moved to the historical ledger.",
            });
            router.refresh();
          } else {
            notify({ variant: "error", title: "Archive Failed", message: "Failed to archive the request." });
          }
        } catch (e: unknown) {
          console.error(e);
          notify({ variant: "error", title: "Archive Failed", message: "An unexpected error occurred." });
        } finally {
          setLoading((state) => ({ ...state, [id]: false }));
        }
      }
    });
  }

  async function edit(need: SupportNeedDTO) {
    prompt({
      title: "Edit Funding Purpose",
      description: `Updating details for: ${need.purpose}`,
      placeholder: "New purpose...",
      confirmLabel: "Update Purpose",
      onConfirm: async (purpose) => {
        setLoading((state) => ({ ...state, [need.id]: true }));
        try {
          const res = await fetch(`/api/support-requests/${need.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ purpose }),
          });
          if (res.ok) {
            notify({
              variant: "success",
              title: "Purpose Updated",
              message: "The funding request has been updated successfully.",
            });
            router.refresh();
          } else {
            notify({ variant: "error", title: "Update Failed", message: "Failed to update the request." });
          }
        } catch (e: unknown) {
          console.error(e);
          notify({ variant: "error", title: "Update Failed", message: "An unexpected error occurred." });
        } finally {
          setLoading((state) => ({ ...state, [need.id]: false }));
        }
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <p className="text-slate-500">No active funding needs to manage.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((need) => (
        <article key={need.id} className="rounded-lg border border-white/10 bg-white/[0.055] p-5 transition-all hover:bg-white/[0.075]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">{need.id.slice(0, 8)}</span>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400">{need.fundName}</p>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-400/10 text-emerald-400">
                  {need.status}
                </span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white">{need.purpose}</h3>
              <p className="mt-3 text-xs text-slate-500">Created by <span className="text-slate-300 font-medium">{need.orgName}</span></p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-black text-white">{formatUsd(Number(need.amount))}</p>
              <div className="mt-3 flex gap-4 justify-end">
                  <button
                    onClick={() => edit(need)}
                    disabled={loading[need.id]}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => archive(need.id)}
                    disabled={loading[need.id]}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline disabled:opacity-50"
                  >
                    Archive
                  </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
