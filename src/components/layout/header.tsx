"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, ChevronDown, Building2, Shield, LogOut, Check, Sparkles, HelpCircle } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onStartTour?: () => void;
}

export function Header({ title, subtitle, onStartTour }: HeaderProps) {
  const { data: session } = useSession();
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const orgMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const orgName = (session?.user as any)?.orgName || "Pulse8 Entretenimento";
  const userName = session?.user?.name || "Administrador Pulse8";
  const userEmail = session?.user?.email || "admin@pulse8.app";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgMenuRef.current && !orgMenuRef.current.contains(event.target as Node)) {
        setIsOrgMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
      {/* ── Title or Search Bar ── */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {title ? (
          <div>
            <h1 className="text-base font-bold font-display text-surface-900 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-surface-500 mt-0.5 leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        ) : (
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar eventos, pessoas, documentos..."
              className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded border border-surface-200 font-mono hidden sm:inline">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      {/* ── Right Actions ── */}
      <div className="flex items-center gap-3">
        {/* Tour Guiado do Produtor */}
        {onStartTour && (
          <button
            onClick={onStartTour}
            title="Iniciar Tour Guiado de Funcionalidades"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 text-brand-700 hover:from-brand-100 hover:to-indigo-100 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span className="hidden md:inline">Tour do Produtor</span>
          </button>
        )}

        {/* Notifications */}
        <button
          title="Notificações"
          className="relative p-2 rounded-lg text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Org Selector Dropdown */}
        <div className="relative" ref={orgMenuRef}>
          <button
            onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-200 hover:bg-surface-50 hover:border-surface-300 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xs">
              <span className="text-2xs font-bold text-white">P8</span>
            </div>
            <span className="text-sm font-medium text-surface-800 max-w-[140px] truncate hidden sm:inline">
              {orgName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
          </button>

          {isOrgMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-surface-200 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-surface-100">
                <span className="text-2xs font-bold uppercase tracking-wider text-surface-400">
                  Organização Atual
                </span>
                <p className="text-sm font-bold text-surface-900 truncate mt-0.5">
                  {orgName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
                  <Check className="w-3.5 h-3.5" />
                  Plano Enterprise Ativo
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/configuracoes"
                  onClick={() => setIsOrgMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-surface-400" />
                  Configurações da Produtora
                </Link>
                <Link
                  href="/seguranca"
                  onClick={() => setIsOrgMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  <Shield className="w-4 h-4 text-surface-400" />
                  Segurança & Logs
                </Link>
              </div>

              <div className="border-t border-surface-100 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sair do Sistema
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title="Menu do Usuário"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white shadow-sm hover:ring-brand-300 transition-all cursor-pointer"
          >
            {userName.slice(0, 2).toUpperCase()}
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-surface-200 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-surface-100">
                <p className="text-sm font-bold text-surface-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-surface-500 truncate">
                  {userEmail}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/configuracoes"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-surface-400" />
                  Minha Conta
                </Link>
                <Link
                  href="/seguranca"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  <Shield className="w-4 h-4 text-surface-400" />
                  Auditoria & LGPD
                </Link>
              </div>

              <div className="border-t border-surface-100 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Encerrar Sessão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
