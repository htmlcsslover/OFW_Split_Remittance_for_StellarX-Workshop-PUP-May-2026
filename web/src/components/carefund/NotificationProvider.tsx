"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import NotificationBanner, { Notification, NotificationVariant } from "./NotificationBanner";

interface NotifyOptions {
  variant?: NotificationVariant;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationContextType {
  notify: (options: NotifyOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback(({ variant = "info", title, message, actionLabel, onAction }: NotifyOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      variant,
      title,
      message,
      actionLabel,
      onAction,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-20 right-0 z-[100] flex flex-col gap-3 p-6 w-full max-w-sm pointer-events-none items-end">
        {notifications.map((n) => (
          <NotificationBanner
            key={n.id}
            notification={n}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
