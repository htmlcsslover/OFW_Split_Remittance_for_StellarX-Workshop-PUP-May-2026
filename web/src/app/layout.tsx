import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { NotificationProvider } from "@/components/carefund/NotificationProvider";
import { ConfirmModalProvider } from "@/components/carefund/ConfirmActionModal";

export const metadata: Metadata = {
  title: "CareFund Stellar",
  description:
    "A unified Stellar community funding platform for social impact programs in the Philippines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <NotificationProvider>
          <ConfirmModalProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </ConfirmModalProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
