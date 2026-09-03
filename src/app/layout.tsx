import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse8 — Gestão Inteligente de Eventos",
  description:
    "Plataforma completa para produção de eventos: orçamento, cronogramas, marketing, promoters, check-in e relatórios em um único sistema.",
  keywords: [
    "gestão de eventos",
    "produção de eventos",
    "sistema de eventos",
    "pulse8",
    "orçamento de eventos",
    "check-in",
    "promoters",
  ],
};

import { AuthProvider } from "@/components/providers/auth-provider";
import { PwaServiceWorker } from "@/components/providers/pwa-service-worker";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4c6ef5" />
      </head>
      <body>
        <AuthProvider>
          <PwaServiceWorker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
