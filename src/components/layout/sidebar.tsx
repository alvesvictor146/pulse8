"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCheck,
  Megaphone,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  ClipboardList,
  Truck,
  QrCode,
  BriefcaseBusiness,
  Shield,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    section: "Principal",
    items: [
      { id: "tour-nav-dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { id: "tour-nav-eventos", name: "Eventos", href: "/eventos", icon: CalendarDays },
    ],
  },
  {
    section: "Operações",
    items: [
      { id: "tour-nav-convidados", name: "Convidados", href: "/convidados", icon: ClipboardList },
      { id: "tour-nav-checkin", name: "Check-in", href: "/checkin", icon: QrCode },
      { id: "tour-nav-cronogramas", name: "Cronogramas", href: "/cronogramas", icon: CalendarDays },
    ],
  },
  {
    section: "Financeiro",
    items: [
      { id: "tour-nav-financeiro", name: "Orçamento & DRE", href: "/financeiro", icon: CreditCard },
      { id: "tour-nav-fornecedores", name: "Fornecedores", href: "/fornecedores", icon: Truck },
    ],
  },
  {
    section: "Pessoas",
    items: [
      { id: "tour-nav-equipe", name: "Equipe & RH", href: "/equipe", icon: Users },
      { id: "tour-nav-funcoes", name: "Funções", href: "/funcoes", icon: BriefcaseBusiness },
      { id: "tour-nav-promoters", name: "Promoters", href: "/promoters", icon: UserCheck },
    ],
  },
  {
    section: "Marketing & BI",
    items: [
      { id: "tour-nav-marketing", name: "Marketing", href: "/marketing", icon: Megaphone },
      { id: "tour-nav-relatorios", name: "Relatórios & DRE", href: "/relatorios", icon: BarChart3 },
    ],
  },
];

const bottomNav = [
  { name: "Configurações", href: "/configuracoes", icon: Settings },
  { name: "Segurança & Logs", href: "/seguranca", icon: Shield },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Administrador Pulse8";
  const userEmail = session?.user?.email || "admin@pulse8.app";
  const userRole = (session?.user as any)?.role === "ADMIN" ? "Admin Geral" : "Produtor";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-surface-900 text-white flex flex-col z-40 transition-all duration-300 shadow-sidebar select-none",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 shadow-md">
          <Zap className="w-4.5 h-4.5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold font-display tracking-tight text-white whitespace-nowrap">
            Pulse<span className="text-brand-400">8</span>
          </span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-1 overflow-x-hidden">
        {navigation.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="text-2xs uppercase tracking-widest text-surface-400 font-semibold px-5 pt-3 pb-1.5 whitespace-nowrap">
                {group.section}
              </p>
            )}
            {collapsed && <div className="pt-2" />}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  id={item.id}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium mx-2 transition-all duration-150",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-surface-300 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center px-0 mx-2"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <span className="truncate whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom Section ── */}
      <div className="border-t border-white/10 py-3 space-y-1 shrink-0 overflow-hidden">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium mx-2 transition-all duration-150",
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-surface-300 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-0 mx-2"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}

        {/* User Profile & Logout */}
        <div
          className={cn(
            "flex items-center gap-2.5 mx-2 mt-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-sm">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {userName}
              </p>
              <p className="text-2xs text-surface-400 truncate">
                {userRole} · {userEmail}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              title="Sair do Sistema"
              className="p-1.5 rounded-lg text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={onToggle}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-800 border border-surface-600 flex items-center justify-center text-surface-300 hover:text-white hover:bg-brand-600 hover:border-brand-500 transition-all duration-200 shadow-md z-50 cursor-pointer"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
