"use client";

import Link from "next/link";
import ConnectWallet from "@/components/ConnectWallet";
import DemoGuide from "./DemoGuide";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Marketplace", "/funds"],
  ["Urgent Needs", "/needs"],
  ["Transparency", "/transparency"],
  ["Admin", "/dashboard/admin"],
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#07100f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.12),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(6,30,28,0.98)_48%,_rgba(10,15,28,0.98))]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 -mx-4 border-b border-white/10 bg-[#07100f]/88 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="group">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/80">
                CareFund Stellar
              </p>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">
                Community funding on Stellar
              </h1>
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <nav className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm text-slate-300">
                {nav.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <ConnectWallet />
            </div>
          </div>
        </header>
        <div className="flex-1 py-8">{children}</div>
      </div>
      <DemoGuide />
    </main>
  );
}
