"use client";

import React, { useState } from "react";
import { Building, Save, CheckCircle2, Shield, Bell, Key } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

export default function ConfiguracoesPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: "Produtora XYZ Eventos Ltda",
    cnpj: "12.345.678/0001-90",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    email: "contato@produtoraxyz.com.br",
    phone: "(11) 3333-4444",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <AppShell title="Configurações Gerais" subtitle="Dados da organização, dados fiscais e preferências do sistema">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card p-8 border border-surface-200/80 bg-white shadow-sm rounded-2xl">
          <h3 className="text-lg font-bold font-display text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-600" />
            Perfil da Produtora / Organização
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Razão Social / Nome da Produtora *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">Telefone Comercial</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">E-mail Administrativo</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Endereço Principal</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
              />
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-surface-100">
              {isSaved ? (
                <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Configurações salvas com sucesso!
                </span>
              ) : (
                <span />
              )}

              <button type="submit" className="btn-primary">
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {/* Seção LGPD & Privacidade */}
        <div className="card p-8 border border-surface-200/80 bg-white shadow-sm rounded-2xl space-y-4">
          <h3 className="text-lg font-bold font-display text-surface-900 border-b border-surface-100 pb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Privacidade e Direitos LGPD
          </h3>
          <p className="text-sm text-surface-500">
            Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode exportar todos os seus dados pessoais ou solicitar a exclusão da sua conta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={async () => {
                const res = await fetch("/api/lgpd/export");
                if (res.ok) {
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `meus-dados-pulse8-${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                } else {
                  alert("Erro ao exportar dados");
                }
              }}
              className="btn-secondary text-xs font-semibold py-2.5 flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              Exportar Meus Dados (JSON/LGPD)
            </button>

            <button
              type="button"
              onClick={async () => {
                if (confirm("ATENÇÃO: Tem certeza que deseja excluir sua conta permanentemente? Esta ação é irreversível e apagará seus dados de acesso conforme a LGPD.")) {
                  const res = await fetch("/api/lgpd/me", { method: "DELETE" });
                  if (res.ok) {
                    alert("Sua conta foi excluída com sucesso.");
                    window.location.href = "/";
                  } else {
                    const data = await res.json();
                    alert("Erro ao excluir conta: " + (data.error || "Tente novamente"));
                  }
                }
              }}
              className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              Excluir Minha Conta (LGPD Art. 18)
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
