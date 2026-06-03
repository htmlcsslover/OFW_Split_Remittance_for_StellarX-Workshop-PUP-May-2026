"use client";

import React, { useState, useEffect } from "react";

export type NotificationVariant = "success" | "error" | "warning" | "info" | "security" | "blockchain";

export interface Notification {
  id: string;
  variant: NotificationVariant;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  timestamp: number;
}

interface NotificationBannerProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export default function NotificationBanner({ notification, onClose }: NotificationBannerProps) {
  const { id, variant, title, message, actionLabel, onAction } = notification;

  useEffect(() => {
    if (variant !== "error" && variant !== "security") {
      const timer = setTimeout(() => {
        onClose(id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, variant, onClose]);

  const getVariantStyles = () => {
    switch (variant) {
      case "success": return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "error": return "border-rose-500/30 bg-rose-500/10 text-rose-400";
      case "warning": return "border-amber-500/30 bg-amber-500/10 text-amber-400";
      case "security": return "border-purple-500/30 bg-purple-500/10 text-purple-400";
      case "blockchain": return "border-teal-500/30 bg-teal-500/10 text-teal-400";
      default: return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "success":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "error":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "security":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case "blockchain":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-4 duration-300 ${getVariantStyles()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black uppercase tracking-wider">{title}</p>
          <p className="mt-1 text-sm opacity-90 leading-relaxed break-words">{message}</p>
          <p className="mt-2 text-[10px] opacity-50 font-bold uppercase tracking-widest">Just now</p>
          
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-3 rounded-md bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
