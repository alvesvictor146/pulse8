"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ProductTour } from "@/components/ui/product-tour";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          collapsed ? "ml-[72px]" : "ml-[260px]"
        )}
      >
        <Header
          title={title}
          subtitle={subtitle}
          onStartTour={() => setIsTourOpen(true)}
        />
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Tour Interativo do Produtor */}
      <ProductTour forceOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}
