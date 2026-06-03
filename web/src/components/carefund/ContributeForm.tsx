"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useNotifications } from "@/components/carefund/NotificationProvider";
import { buildPaymentXDR, pollTransaction, submitSignedXDR } from "@/lib/payment";
import { NETWORK_PASSPHRASE } from "@/lib/stellar";
import { fetchBalances } from "@/lib/balances";
import { formatUsd } from "@/data/carefund";

export type SupportRequestBrief = {
  id: string;
  purpose: string;
  amount: number;
  amountRaised: number;
};

interface FreighterSignResponse {
  signedTxXdr?: string;
  result?: string;
  error?: string;
}

export default function ContributeForm({
  fundId,
  fundName,
  targetAmount,
  currentBalance,
  supportRequestId,
  supportRequests = [],
}: {
  fundId: string;
  fundName: string;
  targetAmount: number;
  currentBalance: number;
  supportRequestId?: string;
  supportRequests?: SupportRequestBrief[];
}) {
  const router = useRouter();
  const wallet = useWallet();
  const { notify } = useNotifications();
  
  const selectedNeed = useMemo(() => 
    supportRequests.find(r => r.id === supportRequestId),
    [supportRequests, supportRequestId]
  );

  const activeTarget = selectedNeed ? selectedNeed.amount : targetAmount;
  const activeBalance = selectedNeed ? selectedNeed.amountRaised : currentBalance;
  const remainingNeeded = Math.max(0, activeTarget - activeBalance);
  const isFullyFunded = remainingNeeded <= 0;

  const defaultAmount = remainingNeeded > 0 && remainingNeeded < 1 ? remainingNeeded.toString() : "1";

  const [amount, setAmount] = useState(defaultAmount);
  const [asset, setAsset] = useState<"USDC" | "XLM">("XLM"); 
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "building" | "signing" | "submitting" | "polling" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const TREASURY = process.env.NEXT_PUBLIC_STELLAR_TREASURY_ADDRESS;
  
  const isValidTreasury = useMemo(() => {
    if (!TREASURY) return false;
    return /^G[A-Z2-7]{55}$/.test(TREASURY);
  }, [TREASURY]);

  useEffect(() => {
    let mounted = true;
    if (wallet.publicKey) {
      fetchBalances(wallet.publicKey).then(b => {
        if (mounted) {
          requestAnimationFrame(() => setXlmBalance(b.xlm));
        }
      }).catch(err => {
        console.error("Failed to fetch balance:", err);
      });
    } else {
      requestAnimationFrame(() => setXlmBalance(null));
    }
    return () => { mounted = false; };
  }, [wallet.publicKey, status]);

  const isBalanceTooLow = useMemo(() => {
    if (asset === "XLM" && xlmBalance && amount) {
      const numAmount = parseFloat(amount);
      const numBalance = parseFloat(xlmBalance);
      return numAmount > (numBalance - 2);
    }
    return false;
  }, [asset, xlmBalance, amount]);

  const isOverfunding = useMemo(() => {
    if (amount) {
      const numAmount = parseFloat(amount);
      return numAmount > remainingNeeded + 0.0000001;
    }
    return false;
  }, [amount, remainingNeeded]);

  const handleContribute = async () => {
    if (!wallet.publicKey) {
      notify({
        variant: "warning",
        title: "Connection Required",
        message: "Please connect your wallet first.",
      });
      setErrorMsg("Connect a wallet first.");
      wallet.connect();
      return;
    }
    
    if (!isValidTreasury) {
      setErrorMsg("Invalid treasury configuration. Please check environment variables.");
      return;
    }

    if (isBalanceTooLow) {
      setErrorMsg("Amount exceeds available Testnet XLM balance.");
      return;
    }

    if (isOverfunding) {
      setErrorMsg(`Exceeds remaining ${selectedNeed ? "need" : "fund goal"} limit.`);
      return;
    }

    setStatus("building");
    setErrorMsg("");

    try {
      const xdr = await buildPaymentXDR(wallet.publicKey, TREASURY!, amount, asset);

      setStatus("signing");
      notify({
        variant: "blockchain",
        title: "Transaction Ready",
        message: "Please sign the contribution transaction in your Freighter wallet.",
      });

      const freighter = await import("@stellar/freighter-api");
      const signed = (await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: wallet.publicKey,
      })) as unknown as (FreighterSignResponse | string);

      let signedTxXdr: string | undefined;
      let error: string | undefined;

      if (typeof signed === "string") {
        signedTxXdr = signed;
      } else {
        signedTxXdr = signed.signedTxXdr || signed.result;
        error = signed.error;
      }

      if (error) {
        throw new Error(error);
      }

      if (!signedTxXdr) {
        throw new Error("Failed to retrieve signed transaction XDR");
      }

      setStatus("submitting");
      const hash = await submitSignedXDR(signedTxXdr);
      if (typeof window !== "undefined") {
        (window as { lastTxHash?: string }).lastTxHash = hash;
      }

      setStatus("polling");
      notify({
        variant: "blockchain",
        title: "Broadcasting",
        message: "Transaction submitted. Waiting for Stellar network finality...",
      });
      await pollTransaction(hash);

      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundId,
          amount: Number(amount),
          asset,
          walletAddress: wallet.publicKey,
          txHash: hash,
          supportRequestId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to record contribution in database.");
      }

      notify({
        variant: "success",
        title: "Impact Confirmed",
        message: `Your contribution to ${fundName} was successful. Thank you for your support!`,
      });
      setStatus("success");
      setTimeout(() => {
        router.push(`/funds/${fundId}`); 
        router.refresh();
      }, 3000);
    } catch (e: unknown) {
      let message = "Contribution failed";
      if (e instanceof Error) {
        message = e.message;
        try {
          if (message.includes("Submit rejected:")) {
            const jsonPart = message.split("Submit rejected:")[1];
            const parsed = JSON.parse(jsonPart);
            if (parsed.extras?.result_codes?.operations) {
              message = `Transaction failed: ${parsed.extras.result_codes.operations.join(", ")}`;
            } else if (parsed.extras?.result_codes?.transaction) {
               message = `Transaction failed: ${parsed.extras.result_codes.transaction}`;
            }
          }
        } catch {
          // ignore
        }
      }
      notify({
        variant: "error",
        title: "Contribution Failed",
        message: message,
      });
      setErrorMsg(message);
      setStatus("error");
    }
  };

  const useRemaining = () => {
    setAmount(remainingNeeded.toString());
  };

  const stellarExpertBase = process.env.NEXT_PUBLIC_STELLAR_EXPERT_BASE_URL || "https://stellar.expert/explorer/testnet/tx";

  if (isFullyFunded) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">Target Reached!</h3>
        <p className="mt-2 text-sm text-emerald-300/80">
          {selectedNeed ? `This specific need ("${selectedNeed.purpose}") is fully sponsored.` : "This program fund has reached its goal."}
        </p>
        <Link href="/funds" className="mt-6 inline-block rounded-md bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-emerald-300">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-xl font-semibold text-white">
                {selectedNeed ? "Sponsor Need" : "Contribute to Program"}
            </h3>
            {selectedNeed ? (
                <p className="text-[10px] text-teal-300 font-bold uppercase tracking-widest mt-1">
                    Target: {selectedNeed.purpose}
                </p>
            ) : (
                <p className="text-[10px] text-teal-300 font-bold uppercase tracking-widest mt-1">
                    Broad Program Support
                </p>
            )}
        </div>
        {xlmBalance !== null && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Your Balance</p>
            <p className="text-sm font-mono font-bold text-teal-300">{xlmBalance} XLM</p>
          </div>
        )}
      </div>
      
      {!isValidTreasury && (
        <div className="mt-4 rounded-md bg-rose-500/10 p-3 text-sm text-rose-300 border border-rose-500/20">
          <p className="font-semibold">Configuration Error:</p>
          <p>Set NEXT_PUBLIC_STELLAR_TREASURY_ADDRESS</p>
        </div>
      )}

      <div className="mt-4 grid gap-4 grid-cols-[1fr_120px]">
        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2.5 text-white focus:border-teal-400 focus:outline-none ${isBalanceTooLow || isOverfunding ? "border-rose-500/50 text-rose-200" : ""}`}
              placeholder="0.00"
              min="0.0000001"
              step="any"
              disabled={(status !== "idle" && status !== "error") || !isValidTreasury}
            />
            {isOverfunding && (
              <button 
                onClick={useRemaining}
                className="absolute right-2 top-2 rounded bg-teal-400/20 px-2 py-1 text-[10px] font-black text-teal-300 hover:bg-teal-400/30"
              >
                Use Max
              </button>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Asset</label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value as "USDC" | "XLM")}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-2 py-2.5 text-[11px] font-bold text-white focus:border-teal-400 focus:outline-none"
            disabled={(status !== "idle" && status !== "error") || !isValidTreasury}
          >
            <option value="XLM">XLM</option>
            <option value="USDC">USDC</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {isBalanceTooLow && (
          <p className="text-xs text-rose-300 font-bold">
            Amount exceeds wallet balance.
          </p>
        )}
        {isOverfunding && (
          <p className="text-xs text-rose-300 font-bold">
            Exceeds remaining {selectedNeed ? "need" : "fund"} ({formatUsd(remainingNeeded)}).
          </p>
        )}
        {!isBalanceTooLow && !isOverfunding && (
          <p className="text-xs text-slate-400 italic leading-relaxed">
            {selectedNeed ? "Direct sponsorship for this itemized need." : "General contribution to program budget."}
          </p>
        )}
      </div>

      <div className="mt-5">
        <button
          onClick={handleContribute}
          disabled={(status !== "idle" && status !== "error") || !isValidTreasury || isBalanceTooLow || isOverfunding || parseFloat(amount) <= 0}
          className={`w-full rounded-md px-4 py-4 text-sm font-black text-slate-950 transition disabled:opacity-50 ${
            status === "success" ? "bg-emerald-400" : "bg-teal-400 hover:bg-teal-300 active:scale-[0.98]"
          }`}
        >
          {!wallet.publicKey ? "Connect Wallet" :
           status === "building" ? "Building..." :
           status === "signing" ? "Waiting for Sign..." :
           status === "submitting" ? "Submitting..." :
           status === "polling" ? "Confirming..." :
           status === "success" ? "Success!" :
           selectedNeed ? "Sponsor This Need" : "Contribute to Program"}
        </button>
      </div>

      {isValidTreasury && (
        <p className="mt-2 text-[10px] text-center text-slate-500 break-all">
          Treasury: {TREASURY}
        </p>
      )}

      {errorMsg && <p className="mt-3 text-sm text-rose-300 whitespace-pre-wrap font-bold">{errorMsg}</p>}
      {status === "success" && (
        <div className="mt-3 text-sm text-emerald-300 animate-in fade-in zoom-in-95">
          <p className="font-bold">✓ Sponsorship recorded successfully.</p>
          <a 
            href={`${stellarExpertBase}/${(typeof window !== "undefined" && (window as { lastTxHash?: string }).lastTxHash) || ""}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block font-semibold underline decoration-emerald-500/30 underline-offset-4 hover:decoration-emerald-500"
          >
            Verify On Stellar Expert →
          </a>
        </div>
      )}
    </div>
  );
}
