"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { TableSkeleton, StatCardSkeleton, EmptyState } from "@/components/ui/skeleton";

interface CostItem {
  id: string;
  title: string;
  totalCost: number;
  dueDate?: string | null;
  status: string;
  supplier?: { name: string; pix?: string | null } | null;
  account?: { name: string } | null;
}

interface DreData {
  summary: {
    totalRevenue: number;
    totalCosts: number;
    totalCommissions: number;
    netProfit: number;
    profitMargin: number;
    paidCosts: number;
    pendingCosts: number;
    plannedCosts: number;
  };
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  paid: { label: "Pago", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  approved: { label: "Aprovado", class: "bg-blue-100 text-blue-700 border-blue-200" },
  pending: { label: "Pendente", class: "bg-amber-100 text-amber-700 border-amber-200" },
  planned: { label: "Planejado", class: "bg-surface-100 text-surface-700 border-surface-200" },
  overdue: { label: "Vencido", class: "bg-red-100 text-red-700 border-red-200" },
};

const INITIAL_FORM = {
  title: "",
  eventId: "",
  category: "Estrutura",
  amount: "",
  dueDate: "",
  status: "pending",
};

export default function FinanceiroPage() {
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [dre, setDre] = useState<DreData | null>(null);
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDreLoading, setIsDreLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newExpense, setNewExpense] = useState(INITIAL_FORM);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const eventId = selectedEventId ? `?eventId=${selectedEventId}` : "";
      const res = await fetch(`/api/finance/costs${eventId}`);
      if (res.ok) {
        const json = await res.json();
        setCosts(json.data ?? json);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId]);

  const loadDre = useCallback(async () => {
    setIsDreLoading(true);
    try {
      const eventId = selectedEventId ? `?eventId=${selectedEventId}` : "";
      const res = await fetch(`/api/finance/dre${eventId}`);
      if (res.ok) setDre(await res.json());
    } finally {
      setIsDreLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.ok ? r.json() : { data: [] })
      .then((json) => {
        const evs = json.data ?? json;
        setEvents(evs);
        if (evs.length > 0) setSelectedEventId(evs[0].id);
      });
  }, []);

  useEffect(() => {
    loadData();
    loadDre();
  }, [loadData, loadDre]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    setIsSaving(true);

    const eventId = newExpense.eventId || selectedEventId || events[0]?.id;
    if (!eventId) {
      alert("Selecione um evento antes de adicionar despesa.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/finance/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          title: newExpense.title,
          qty: 1,
          unitCost: parseFloat(newExpense.amount),
          dueDate: newExpense.dueDate || null,
          status: newExpense.status,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewExpense(INITIAL_FORM);
        await loadData();
        await loadDre();
      } else {
        const err = await res.json();
        alert("Erro ao salvar: " + (err.error || "Tente novamente"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkPaid = async (costId: string, currentStatus: string) => {
    const newStatus = currentStatus === "paid" ? "pending" : "paid";
    const res = await fetch(`/api/finance/costs/${costId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, paidAt: newStatus === "paid" ? new Date().toISOString() : null }),
    });
    if (res.ok) {
      setCosts((prev) => prev.map((c) => c.id === costId ? { ...c, status: newStatus } : c));
      await loadDre();
    }
  };

  const handleImportCsv = async () => {
    if (!importFile) return;
    setIsImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", importFile);
    if (selectedEventId) formData.append("eventId", selectedEventId);

    try {
      const res = await fetch("/api/import/sympla", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setImportResult({ count: data.imported ?? 0, message: data.message ?? "Importação concluída!" });
        await loadDre();
        await loadData();
      } else {
        setImportResult({ count: 0, message: "Erro: " + (data.error || "Falha na importação") });
      }
    } finally {
      setIsImporting(false);
    }
  };

  const dr = dre?.summary;
  const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <AppShell title="Financeiro & DRE" subtitle="Controle de orçamento, despesas e DRE em tempo real">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-surface-900">Visão Geral Financeira</h2>
            <p className="text-sm text-surface-500">Dados reais do banco de dados</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {events.length > 0 && (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="input py-2 px-3 w-auto text-sm"
              >
                <option value="">Todos os eventos</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            )}
            <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary text-xs font-semibold py-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Importar Sympla (CSV)
            </button>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs font-semibold py-2.5">
              <Plus className="w-4 h-4" />
              Nova Despesa
            </button>
          </div>
        </div>

        {/* DRE KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isDreLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : !dr ? (
            <div className="col-span-4">
              <EmptyState
                icon={DollarSign}
                title="Sem dados financeiros"
                message="Adicione receitas e despesas para ver o DRE calculado."
              />
            </div>
          ) : (
            <>
              <div className="card p-5 border border-surface-200/80 bg-white shadow-sm">
                <div className="flex justify-between items-center text-surface-500 text-xs font-medium">
                  <span>Receita Total</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-display text-emerald-600">{fmtBRL(dr.totalRevenue)}</span>
                  <p className="text-xs text-surface-400 mt-1">Sympla + Bar + Patrocínio</p>
                </div>
              </div>

              <div className="card p-5 border border-surface-200/80 bg-white shadow-sm">
                <div className="flex justify-between items-center text-surface-500 text-xs font-medium">
                  <span>Despesas Pagas</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-display text-surface-900">{fmtBRL(dr.paidCosts)}</span>
                  <p className="text-xs text-surface-400 mt-1">Baixas efetuadas</p>
                </div>
              </div>

              <div className="card p-5 border border-surface-200/80 bg-white shadow-sm">
                <div className="flex justify-between items-center text-surface-500 text-xs font-medium">
                  <span>A Pagar / Pendente</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-display text-amber-600">{fmtBRL(dr.pendingCosts)}</span>
                  <p className="text-xs text-surface-400 mt-1">Aguardando aprovação</p>
                </div>
              </div>

              <div className={`card p-5 border shadow-md ${dr.netProfit >= 0 ? "bg-gradient-to-br from-brand-900 via-surface-900 to-surface-950 border-brand-200 text-white" : "border-red-200 bg-red-50"}`}>
                <div className="flex justify-between items-center text-xs font-medium opacity-70">
                  <span>Resultado (DRE)</span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`text-2xl font-bold font-display ${dr.netProfit >= 0 ? "text-emerald-400" : "text-red-600"}`}>
                    {fmtBRL(dr.netProfit)}
                  </span>
                  <p className="text-xs mt-1 opacity-60">Margem: {dr.profitMargin}%</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Expenses Table */}
        <div className="card border border-surface-200/80 bg-white overflow-hidden shadow-sm">
          <div className="p-5 border-b border-surface-100 flex justify-between items-center">
            <h3 className="text-lg font-bold font-display text-surface-900">Lançamentos de Despesas</h3>
            <span className="text-xs text-surface-500 font-medium">{costs.length} registros</span>
          </div>

          {isLoading ? (
            <div className="p-4"><TableSkeleton rows={5} cols={5} /></div>
          ) : costs.length === 0 ? (
            <EmptyState
              icon={TrendingDown}
              title="Nenhuma despesa lançada"
              message="Clique em 'Nova Despesa' para registrar custos do evento."
              action={
                <button onClick={() => setIsModalOpen(true)} className="btn-primary text-sm">
                  <Plus className="w-4 h-4" /> Nova Despesa
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-50 text-surface-500 font-medium border-b border-surface-100">
                  <tr>
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Fornecedor</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {costs.map((cost) => (
                    <tr key={cost.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-surface-900">{cost.title}</div>
                        {cost.account?.name && <div className="text-xs text-surface-400">{cost.account.name}</div>}
                      </td>
                      <td className="p-4">
                        <div className="text-surface-900 font-medium">{cost.supplier?.name || "—"}</div>
                        {cost.supplier?.pix && <div className="text-xs text-surface-400 font-mono">PIX: {cost.supplier.pix}</div>}
                      </td>
                      <td className="p-4 text-surface-600 font-medium">
                        {cost.dueDate ? new Date(cost.dueDate).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="p-4 font-bold text-surface-900">
                        {fmtBRL(Number(cost.totalCost))}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[cost.status]?.class}`}>
                          {STATUS_CONFIG[cost.status]?.label ?? cost.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleMarkPaid(cost.id, cost.status)}
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          {cost.status === "paid" ? "Estornar" : "Dar Baixa PIX"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Nova Despesa */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-lg p-6 bg-white border border-surface-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 pb-3">
                <h3 className="text-lg font-bold font-display text-surface-900">Lançar Nova Despesa</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                {events.length > 1 && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Evento *</label>
                    <select
                      value={newExpense.eventId}
                      onChange={(e) => setNewExpense({ ...newExpense, eventId: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="">Selecione o evento</option>
                      {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Título da Despesa *</label>
                  <input
                    type="text" required placeholder="Ex: Aluguel de Geradores"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Valor (R$) *</label>
                    <input
                      type="number" step="0.01" required placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Vencimento</label>
                    <input
                      type="date"
                      value={newExpense.dueDate}
                      onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Status inicial</label>
                  <select value={newExpense.status} onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value })} className="input">
                    <option value="planned">Planejado</option>
                    <option value="pending">Pendente</option>
                    <option value="approved">Aprovado</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" disabled={isSaving} className="btn-primary">
                    {isSaving ? "Salvando..." : "Salvar Despesa"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Importação Sympla CSV */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-md p-6 bg-white border border-surface-200 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-surface-900">Importar Vendas Sympla (CSV)</h3>
              <p className="text-sm text-surface-500">Selecione o arquivo CSV exportado do painel do Sympla.</p>

              <div className="border-2 border-dashed border-surface-200 rounded-xl p-6 hover:border-brand-400 transition-colors cursor-pointer bg-surface-50/50">
                <input type="file" accept=".csv" className="hidden" id="csvInput" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                <label htmlFor="csvInput" className="cursor-pointer space-y-2 block">
                  <Download className="w-8 h-8 text-surface-400 mx-auto" />
                  <span className="text-xs font-semibold text-brand-600 block">
                    {importFile ? importFile.name : "Clique para selecionar arquivo CSV"}
                  </span>
                  <span className="text-[11px] text-surface-400 block">Formato: UTF-8 CSV do Sympla</span>
                </label>
              </div>

              {importResult && (
                <div className={`p-3 rounded-lg text-sm font-medium ${importResult.count > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {importResult.count > 0 && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                  {importResult.count > 0 && <AlertCircle className="w-4 h-4 inline mr-1 hidden" />}
                  {importResult.message} {importResult.count > 0 && `(${importResult.count} registros)`}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setIsImportModalOpen(false); setImportFile(null); setImportResult(null); }} className="btn-secondary">
                  Fechar
                </button>
                {importFile && (
                  <button onClick={handleImportCsv} disabled={isImporting} className="btn-primary">
                    {isImporting ? "Importando..." : "Importar"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
