"use client";

import { useState } from "react";
import { categoryLabels } from "@/data/carefund";
import { useWallet } from "@/hooks/useWallet";
import { useNotifications } from "@/components/carefund/NotificationProvider";

export default function ModuleForm({
  funds,
}: {
  funds: { id: string; name: string; category: string }[];
}) {
  const [status, setStatus] = useState<string | null>(null);
  const { publicKey, connect } = useWallet();
  const { notify } = useNotifications();

  async function submit(formData: FormData) {
    if (!publicKey) {
      notify({
        variant: "warning",
        title: "Connection Required",
        message: "Please connect your Stellar wallet first.",
      });
      setStatus("❌ Error: Connect a wallet first.");
      connect();
      return;
    }
    setStatus("Submitting...");
    const amount = Number(formData.get("amount") || 0);
    const purpose = String(formData.get("purpose") || "Support request");
    const description = String(formData.get("description") || "");
    const fundId = String(formData.get("fundId"));
    const requesterId = "demo-requester-id"; 

    try {
      const res = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundId,
          requesterId,
          amount,
          purpose,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      notify({
        variant: "success",
        title: "Request Published",
        message: `Your support need for "${purpose}" has been published and is awaiting verification.`,
      });
      setStatus("✓ Need published and awaiting verification");
      // Optional: Clear form or redirect
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not publish need";
      notify({
        variant: "error",
        title: "Submission Failed",
        message: msg,
      });
      setStatus(`❌ Error: ${msg}`);
    }
  }

  return (
    <form action={submit} className="rounded-lg border border-white/10 bg-white/[0.055] p-5">
      <h2 className="text-2xl font-semibold text-white">Request Funding</h2>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-slate-300">
          Impact Program
          <select
            name="fundId"
            required
            className="rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-white"
          >
            {funds.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({categoryLabels[item.category] || item.category})
              </option>
            ))}
          </select>
        </label>
        
        <label className="grid gap-2 text-sm text-slate-300">
          Need Title
          <input
            name="purpose"
            required
            className="rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-white"
            placeholder="e.g. Inverter Repair"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-300">
          Amount Needed (USDC)
          <input
            name="amount"
            type="number"
            min="1"
            required
            className="rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-white"
          />
        </label>
        
        <label className="grid gap-2 text-sm text-slate-300">
          Detailed Description
          <textarea
            name="description"
            rows={3}
            className="rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-white"
            placeholder="Explain the specific need and impact."
          />
        </label>
      </div>
      <button className="mt-5 w-full rounded-md bg-teal-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200">
        Publish Need
      </button>
      {status && <p className="mt-3 text-sm text-teal-100">{status}</p>}
    </form>
  );
}
