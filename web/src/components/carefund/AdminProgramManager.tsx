"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsd } from "@/data/carefund";
import { useNotifications } from "@/components/carefund/NotificationProvider";
import { useConfirmModal } from "@/components/carefund/ConfirmActionModal";
import { FundDTO } from "./AdminFundApprovalList";

export default function AdminProgramManager({
  initialFunds,
}: {
  initialFunds: FundDTO[];
}) {
  const router = useRouter();
  const [funds, setFunds] = useState(initialFunds);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { notify } = useNotifications();
  const { confirm, prompt } = useConfirmModal();

  async function archive(id: string) {
    confirm({
      title: "Archive Impact Program",
      description: "Are you sure you want to archive this program? It will be removed from the public marketplace and donor contributions will be halted.",
      confirmLabel: "Archive Program",
      variant: "danger",
      onConfirm: async () => {
        setLoading((state) => ({ ...state, [id]: true }));
        try {
          const res = await fetch(`/api/funds/${id}/archive`, {
            method: "POST",
          });
          if (res.ok) {
            setFunds((state) => state.filter(f => f.id !== id));
            notify({
              variant: "info",
              title: "Program Archived",
              message: "The program has been moved to the historical record.",
            });
            router.refresh();
          } else {
            notify({ variant: "error", title: "Archive Failed", message: "Failed to archive the program." });
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

  async function edit(fund: FundDTO) {
    prompt({
      title: "Edit Program Name",
      description: `Updating details for: ${fund.name}`,
      placeholder: "New program name...",
      confirmLabel: "Update Name",
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
              title: "Program Updated",
              message: "The program details have been synchronized.",
            });
            router.refresh();
          } else {
            notify({ variant: "error", title: "Update Failed", message: "Failed to update program." });
          }
        } catch (e: unknown) {
          console.error(e);
          notify({ variant: "error", title: "Update Failed", message: "An unexpected error occurred." });
        } finally {
          setLoading((state) => ({ ...state, [fund.id]: false }));
        }
      }
    });
  }

  const activePrograms = funds.filter(f => f.status === "ACTIVE");
  const finishedPrograms = funds.filter(f => f.status === "COMPLETED" || f.status === "CLOSED");

  if (activePrograms.length === 0 && finishedPrograms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <p className="text-slate-500">No active or finished programs to manage.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {[...activePrograms, ...finishedPrograms].map((fund) => (
        <article key={fund.id} className="rounded-lg border border-white/10 bg-white/[0.055] p-5 transition-all hover:bg-white/[0.075]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">{fund.id.slice(0, 8)}</span>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-400">{fund.category}</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  fund.status === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                }`}>
                  {fund.status}
                </span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white">{fund.name}</h3>
              <p className="mt-3 text-xs text-slate-500">Created by <span className="text-slate-300 font-medium">{fund.organization.displayName || "Unknown Org"}</span></p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-black text-white">{formatUsd(Number(fund.targetAmount))}</p>
              <div className="mt-3 flex gap-4 justify-end">
                  <button
                    onClick={() => edit(fund)}
                    disabled={loading[fund.id]}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => archive(fund.id)}
                    disabled={loading[fund.id]}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline disabled:opacity-50"
                  >
                    {loading[fund.id] ? "Archiving..." : "Archive"}
                  </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
