"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useNotifications } from "@/components/carefund/NotificationProvider";

const TIMEOUT_MS = 3000;

function withTimeout<T>(p: Promise<T>, fallback: T, ms = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export interface WalletState {
  publicKey: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotifications();

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("stellar_publicKey") : null;
    if (saved) {
      const raf = requestAnimationFrame(() => {
        setPublicKey(saved);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") return;

    setConnecting(true);
    setError(null);
    try {
      const freighter = await import("@stellar/freighter-api");

      const connectedResult = await withTimeout(freighter.isConnected() as Promise<any>, false);
      const connected =
        typeof connectedResult === "boolean"
          ? connectedResult
          : (connectedResult as { isConnected: boolean })?.isConnected;

      if (!connected) {
        throw new Error(
          "Freighter not detected. Please install the Freighter extension and reload."
        );
      }

      await freighter.requestAccess();

      const addressResult = await freighter.getAddress();
      const address =
        typeof addressResult === "string"
          ? addressResult
          : (addressResult as { address: string })?.address;

      if (!address) {
        throw new Error("No wallet address returned from Freighter.");
      }

      setPublicKey(address);
      localStorage.setItem("stellar_publicKey", address);

      notify({
        variant: "success",
        title: "Wallet Connected",
        message: `Authorized access for ${address.slice(0, 4)}...${address.slice(-4)}`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to connect wallet";
      console.error("Freighter connect failed:", e);
      setError(msg);
      localStorage.removeItem("stellar_publicKey");
      notify({
        variant: "error",
        title: "Connection Failed",
        message: msg,
      });
    } finally {
      setConnecting(false);
    }
  }, [notify]);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("stellar_publicKey");
    }
    notify({
      variant: "info",
      title: "Wallet Disconnected",
      message: "Session ended. Browser-level authentication cleared.",
    });
  }, [notify]);

  return (
    <WalletContext.Provider value={{ publicKey, connecting, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
