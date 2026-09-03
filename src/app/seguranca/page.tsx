"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Eye,
  Key,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const MOCK_AUDIT_LOGS = [
  { id: "log-1", actor: "Carlos Eduardo (Admin)", action: "CREATE_EVENT", entity: "Event", entityId: "evt-1", ip: "189.120.45.12", time: "2026-09-02 19:45:12" },
  { id: "log-2", actor: "Mariana Ximenes", action: "BAIXA_PIX_DESPESA", entity: "CostItem", entityId: "c-1", ip: "189.120.45.14", time: "2026-09-02 18:30:00" },
  { id: "log-3", actor: "Sistema (PWA Portaria)", action: "CHECKIN_GUEST", entity: "Guest", entityId: "g-1", ip: "177.80.22.05", time: "2026-09-02 17:15:22" },
  { id: "log-4", actor: "Vanessa Prado", action: "GENERATE_UTM_LINK", entity: "PromoLink", entityId: "l-1", ip: "179.100.11.88", time: "2026-09-02 15:10:05" },
];

export default function SegurancaPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [logs] = useState(MOCK_AUDIT_LOGS);

  return (
    <AppShell title="Segurança & Logs de Auditoria" subtitle="Controle de autenticação em duas etapas (2FA), registros imutáveis e governança LGPD">
      <div className="space-y-6">
        {/* Top Cards: 2FA & LGPD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 2FA Card */}
          <div className="card p-6 border border-surface-200/80 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-surface-900">Autenticação de Dois Fatores (2FA)</h3>
                  <p className="text-xs text-surface-500">Exigir código OTP por aplicativo autenticador</p>
                </div>
              </div>

              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactorEnabled ? "bg-emerald-500" : "bg-surface-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-3 bg-surface-50 rounded-xl border border-surface-100 text-xs text-surface-600 space-y-1">
              <div className="font-semibold text-surface-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                2FA Ativado para administradores da produtora
              </div>
              <p>Códigos de segurança gerados via Google Authenticator ou Authy.</p>
            </div>
          </div>

          {/* LGPD Card */}
          <div className="card p-6 border border-surface-200/80 bg-white shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold font-display text-surface-900">Governança & Conformidade LGPD</h3>
                <p className="text-xs text-surface-500">Gestão de privacidade de dados pessoais de convidados</p>
              </div>
            </div>

            <div className="p-3 bg-surface-50 rounded-xl border border-surface-100 text-xs text-surface-600 space-y-1">
              <div className="font-semibold text-surface-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-brand-600" />
                Criptografia AES-256 e DPO ativado
              </div>
              <p>Dados de titulares anonimizados automaticamente após o encerramento do evento.</p>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="card border border-surface-200/80 bg-white overflow-hidden shadow-sm space-y-4">
          <div className="p-5 border-b border-surface-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-bold font-display text-surface-900">Logs de Auditoria Imutáveis</h3>
            </div>
            <span className="text-xs text-surface-500 font-medium">Últimas 50 mutações</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 text-surface-500 font-medium border-b border-surface-100">
                <tr>
                  <th className="p-4">Usuário / Ator</th>
                  <th className="p-4">Ação Registrada</th>
                  <th className="p-4">Entidade</th>
                  <th className="p-4">Endereço IP</th>
                  <th className="p-4 text-right">Data & Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="p-4 font-bold text-surface-900">{log.actor}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-2xs font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-surface-700 font-medium">{log.entity} ({log.entityId})</td>
                    <td className="p-4 font-mono text-xs text-surface-500">{log.ip}</td>
                    <td className="p-4 text-right text-xs text-surface-500 font-medium">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
