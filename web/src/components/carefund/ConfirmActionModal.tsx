"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  onConfirm: () => void | Promise<void>;
}

interface PromptOptions extends Omit<ConfirmOptions, "onConfirm"> {
  placeholder?: string;
  onConfirm: (value: string) => void | Promise<void>;
}

interface ConfirmModalContextType {
  confirm: (options: ConfirmOptions) => void;
  prompt: (options: PromptOptions) => void;
}

const ConfirmModalContext = createContext<ConfirmModalContextType | undefined>(undefined);

export function ConfirmModalProvider({ children }: { children: ReactNode }) {
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [promptOptions, setPromptOptions] = useState<PromptOptions | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmOptions(options);
  }, []);

  const prompt = useCallback((options: PromptOptions) => {
    setPromptOptions(options);
    setPromptValue("");
  }, []);

  const handleClose = () => {
    if (loading) return;
    setConfirmOptions(null);
    setPromptOptions(null);
  };

  const handleConfirm = async () => {
    if (confirmOptions) {
      setLoading(true);
      try {
        await confirmOptions.onConfirm();
      } finally {
        setLoading(false);
        setConfirmOptions(null);
      }
    }
  };

  const handlePromptConfirm = async () => {
    if (promptOptions) {
      setLoading(true);
      try {
        await promptOptions.onConfirm(promptValue);
      } finally {
        setLoading(false);
        setPromptOptions(null);
      }
    }
  };

  return (
    <ConfirmModalContext.Provider value={{ confirm, prompt }}>
      {children}

      {/* Confirmation Modal */}
      {confirmOptions && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-white">{confirmOptions.title}</h3>
            <p className="mt-3 text-slate-400 leading-relaxed">{confirmOptions.description}</p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                disabled={loading}
                onClick={handleClose}
                className="flex-1 rounded-lg bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {confirmOptions.cancelLabel || "Cancel"}
              </button>
              <button
                disabled={loading}
                onClick={handleConfirm}
                className={`flex-1 rounded-lg py-3 text-sm font-black text-slate-950 transition-all active:scale-[0.98] disabled:opacity-50 ${
                  confirmOptions.variant === "danger" ? "bg-rose-400 hover:bg-rose-300" : "bg-teal-400 hover:bg-teal-300"
                }`}
              >
                {loading ? "Processing..." : (confirmOptions.confirmLabel || "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {promptOptions && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-white">{promptOptions.title}</h3>
            <p className="mt-3 text-slate-400 leading-relaxed">{promptOptions.description}</p>
            
            <div className="mt-6">
                <input
                    type="text"
                    autoFocus
                    placeholder={promptOptions.placeholder}
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/50"
                />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                disabled={loading}
                onClick={handleClose}
                className="flex-1 rounded-lg bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {promptOptions.cancelLabel || "Cancel"}
              </button>
              <button
                disabled={loading || !promptValue.trim()}
                onClick={handlePromptConfirm}
                className={`flex-1 rounded-lg py-3 text-sm font-black text-slate-950 transition-all active:scale-[0.98] disabled:opacity-50 ${
                  promptOptions.variant === "danger" ? "bg-rose-400 hover:bg-rose-300" : "bg-teal-400 hover:bg-teal-300"
                }`}
              >
                {loading ? "Processing..." : (promptOptions.confirmLabel || "Submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmModalContext.Provider>
  );
}

export function useConfirmModal() {
  const context = useContext(ConfirmModalContext);
  if (!context) {
    throw new Error("useConfirmModal must be used within a ConfirmModalProvider");
  }
  return context;
}
