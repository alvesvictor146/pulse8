"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import {
  Trophy,
  Link as LinkIcon,
  DollarSign,
  TrendingUp,
  Plus,
  Copy,
  Check,
  Search,
  Filter,
  Users,
  CreditCard,
  X,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const MOCK_PROMOTERS = [
  {
    id: "p-1",
    name: "Vanessa Prado",
    team: "Equipe Alpha SP",
    level: "Gold",
    ticketsSold: 420,
    grossSales: 67200,
    commissionRate: 10, // 10%
    commissionEarned: 6720,
    pixKey: "vanessa.prado@email.com",
    code: "VANESSA10",
    utmUrl: "https://pulse8.com/e/pulsar2026?utm_source=promoter&utm_medium=VANESSA10",
  },
  {
    id: "p-2",
    name: "Matheus Silveira",
    team: "Equipe Alpha SP",
    level: "Gold",
    ticketsSold: 350,
    grossSales: 56000,
    commissionRate: 10,
    commissionEarned: 5600,
    pixKey: "(11) 98765-4321",
    code: "MATHEUSVIP",
    utmUrl: "https://pulse8.com/e/pulsar2026?utm_source=promoter&utm_medium=MATHEUSVIP",
  },
  {
    id: "p-3",
    name: "Camila Nogueira",
    team: "Equipe Beta RJ",
    level: "Silver",
    ticketsSold: 210,
    grossSales: 33600,
    commissionRate: 8,
    commissionEarned: 2688,
    pixKey: "camila@pix.com",
    code: "CAMILA21",
    utmUrl: "https://pulse8.com/e/pulsar2026?utm_source=promoter&utm_medium=CAMILA21",
  },
  {
    id: "p-4",
    name: "Felipe Andrade",
    team: "Equipe Alpha SP",
    level: "Junior",
    ticketsSold: 95,
    grossSales: 15200,
    commissionRate: 5,
    commissionEarned: 760,
    pixKey: "123.456.789-00",
    code: "FELIPEP8",
    utmUrl: "https://pulse8.com/e/pulsar2026?utm_source=promoter&utm_medium=FELIPEP8",
  },
];

const PROMOTER_FORM_INIT = { name: "", email: "", phone: "", pixKey: "", team: "Equipe Alpha SP", level: "junior", code: "", commissionRate: "10" };

export default function PromotersPage() {
  const [promoters, setPromoters] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPromoter, setNewPromoter] = useState(PROMOTER_FORM_INIT);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pRes, lRes] = await Promise.all([
        fetch("/api/promoters"),
        fetch("/api/promoters/leaderboard"),
      ]);
      if (pRes.ok) { const d = await pRes.json(); setPromoters(d.data ?? d); }
      if (lRes.ok) { const d = await lRes.json(); setLeaderboard(d.data ?? d ?? []); }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCopyUtm = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddPromoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoter.name) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/promoters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPromoter),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewPromoter(PROMOTER_FORM_INIT);
        await loadData();
      } else {
        const err = await res.json();
        alert("Erro: " + (err.error || "Falha ao cadastrar"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const displayList = leaderboard.length > 0 ? leaderboard : promoters;
  const totalCommissions = displayList.reduce((acc: number, p: any) => acc + (p.commissionEarned || p.totalCommission || 0), 0);
  const totalTickets = displayList.reduce((acc: number, p: any) => acc + (p.ticketsSold || p.totalSales || 0), 0);

  return (
    <AppShell title="Promoters & Força de Vendas" subtitle="Gestão de promoters, geração de links UTM, comissionamento e ranking">
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar promoter por nome ou cupom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs font-semibold py-2.5">
            <Plus className="w-4 h-4" />
            Novo Promoter
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card p-5 border border-surface-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-surface-500 font-medium">Ingressos via Promoters</div>
              <div className="text-2xl font-bold font-display text-surface-900 mt-1">{totalTickets.toLocaleString()} unidades</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="card p-5 border border-surface-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-surface-500 font-medium">Promoters Ativos</div>
              <div className="text-2xl font-bold font-display text-brand-600 mt-1">{promoters.length} pessoas</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="card p-5 border border-surface-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-surface-500 font-medium">Comissões Acumuladas</div>
              <div className="text-2xl font-bold font-display text-emerald-600 mt-1">
                R$ {totalCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="card border border-surface-200/80 bg-white overflow-hidden shadow-sm">
          <div className="p-5 border-b border-surface-100 flex justify-between items-center">
            <h3 className="text-lg font-bold font-display text-surface-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Leaderboard / Ranking de Vendas
            </h3>
            <span className="text-xs text-surface-500 font-medium">{displayList.length} promoters</span>
          </div>

          {isLoading ? (
            <div className="p-4"><TableSkeleton rows={4} cols={5} /></div>
          ) : displayList.length === 0 ? (
            <EmptyState icon={Users} title="Sem promoters cadastrados" message="Cadastre o primeiro promoter para começar a gerar links UTM e comissões." />
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 text-surface-500 font-medium border-b border-surface-100">
                <tr>
                  <th className="p-4">Posição / Promoter</th>
                  <th className="p-4">Equipe</th>
                  <th className="p-4">Vendas</th>
                  <th className="p-4">Comissão</th>
                  <th className="p-4">Link UTM</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {displayList.map((p: any, idx: number) => (
                  <tr key={p.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="p-4 font-bold text-surface-900">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? "bg-amber-400 text-surface-950" : idx === 1 ? "bg-slate-300 text-surface-900" : idx === 2 ? "bg-amber-700 text-white" : "bg-surface-100 text-surface-600"
                        }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <div>{p.fullName || p.name}</div>
                          <div className="text-xs text-surface-400 font-normal">Equipe: {p.team || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-surface-700">{p.team || "—"}</td>
                    <td className="p-4 font-bold text-surface-900">{(p.ticketsSold || p.totalSales || 0).toLocaleString()} un.</td>
                    <td className="p-4 font-bold text-emerald-600">
                      R$ {(p.commissionEarned || p.totalCommission || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-surface-400 italic">— gerar link via campanha —</span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="btn-secondary py-1 px-3 text-xs">Pagar PIX</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Modal Novo Promoter */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-lg p-6 bg-white border border-surface-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 pb-3">
                <h3 className="text-lg font-bold font-display text-surface-900">Cadastrar Novo Promoter</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPromoter} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Nome do Promoter *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Ferreira"
                    value={newPromoter.name}
                    onChange={(e) => setNewPromoter({ ...newPromoter, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Cupom / Código UTM</label>
                    <input
                      type="text"
                      placeholder="Ex: LUCASVIP"
                      value={newPromoter.code}
                      onChange={(e) => setNewPromoter({ ...newPromoter, code: e.target.value.toUpperCase() })}
                      className="input uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Taxa de Comissão (%)</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={newPromoter.commissionRate}
                      onChange={(e) => setNewPromoter({ ...newPromoter, commissionRate: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Equipe de Vendas</label>
                    <select
                      value={newPromoter.team}
                      onChange={(e) => setNewPromoter({ ...newPromoter, team: e.target.value })}
                      className="input bg-white"
                    >
                      <option value="Equipe Alpha SP">Equipe Alpha SP</option>
                      <option value="Equipe Beta RJ">Equipe Beta RJ</option>
                      <option value="Equipe Vendas Diretas">Equipe Vendas Diretas</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Chave PIX</label>
                    <input
                      type="text"
                      placeholder="CPF, E-mail ou Tel"
                      value={newPromoter.pixKey}
                      onChange={(e) => setNewPromoter({ ...newPromoter, pixKey: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSaving} className="btn-primary">
                    {isSaving ? "Salvando..." : "Cadastrar Promoter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
