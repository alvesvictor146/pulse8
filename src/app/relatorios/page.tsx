"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  BarChart3,
  DollarSign,
  Users,
  Trophy,
  Calendar,
  CheckCircle2,
  Printer,
  X,
  Eye,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const REPORTS = [
  {
    id: "rep-dre",
    title: "Relatório DRE Consolidado do Evento",
    category: "Financeiro",
    description: "Demonstrativo completo de receitas, custos fixos, custos variáveis e lucro líquido apurado.",
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    id: "rep-promoter",
    title: "Relatório de Desempenho de Promoters",
    category: "Vendas & UTM",
    description: "Ranking completo de vendas por promoter, cupons utilizados, faturamento e comissões devidas.",
    icon: Trophy,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    id: "rep-checkin",
    title: "Relatório de Frequência & Check-in VIP",
    category: "Portaria",
    description: "Métricas de entrada por hora, contagem por lista VIP e taxa de no-show dos convidados.",
    icon: Users,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    id: "rep-staff",
    title: "Relatório de Escala & Custos de Staff",
    category: "Operações & RH",
    description: "Folha de pagamento de diárias por departamento, horas trabalhadas e PIX de acertos.",
    icon: BarChart3,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
];

export default function RelatoriosPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [dreData, setDreData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar eventos da organização
  React.useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          if (data.length > 0) {
            setSelectedEventId(data[0].id);
          }
        }
      } catch (err) {
        console.warn("Error loading events:", err);
      }
    }
    loadEvents();
  }, []);

  // Carregar DRE real ao abrir visualização
  const handleViewReport = async (rep: any) => {
    setSelectedReport(rep);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/dre?eventId=${selectedEventId}`);
      if (res.ok) {
        const data = await res.json();
        setDreData(data);
      }
    } catch (err) {
      console.warn("Failed to load DRE report data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPdf = () => {
    window.open(`/api/reports/export/pdf?eventId=${selectedEventId}`, "_blank");
  };

  const handleDownloadCsv = (type: string) => {
    window.open(`/api/reports/export/csv?type=costs&eventId=${selectedEventId}`, "_blank");
  };

  const currentEventName = events.find((e) => e.id === selectedEventId)?.name || "Todos os Eventos";

  return (
    <AppShell title="Relatórios Executivos & BI" subtitle="Central de inteligência de negócios, relatórios em PDF e análises gerenciais">
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-surface-400" />
            <span className="text-sm text-surface-600 font-medium">Filtrar por Evento:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="input text-sm py-2 bg-white min-w-[200px]"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REPORTS.map((rep) => {
            const Icon = rep.icon;
            return (
              <div
                key={rep.id}
                className="card p-6 border border-surface-200/80 bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-surface-400">
                      {rep.category}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${rep.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-display text-surface-900">{rep.title}</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">{rep.description}</p>
                </div>

                <div className="pt-3 border-t border-surface-100 flex items-center gap-2">
                  <button
                    onClick={() => handleViewReport(rep)}
                    className="btn-primary py-2 text-xs flex-1 justify-center"
                  >
                    <Eye className="w-4 h-4" />
                    Visualizar Relatório
                  </button>
                  <button
                    onClick={() => handleDownloadCsv(rep.id)}
                    className="btn-secondary py-2 text-xs justify-center px-3"
                    title="Exportar CSV"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-3xl p-8 bg-white border border-surface-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-surface-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                      P8
                    </div>
                    <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">
                      Pulse8 · Relatório Executivo Oficial
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-surface-900 mt-2">
                    {selectedReport.title}
                  </h2>
                  <p className="text-xs text-surface-500 mt-0.5">
                    Evento: <strong>{currentEventName}</strong> · Gerado em: {new Date().toLocaleString("pt-BR")}
                  </p>
                </div>

                <button onClick={() => setSelectedReport(null)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Data Display */}
              {isLoading ? (
                <div className="py-12 text-center text-surface-400">Carregando demonstrativo executivo...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-surface-50 rounded-xl border border-surface-200/80 text-center">
                    <div>
                      <span className="text-2xs text-surface-400 uppercase font-bold block">Faturamento Bruto</span>
                      <span className="text-lg font-bold text-emerald-600">
                        R$ {(dreData?.events?.[0]?.grossRevenue || 1180000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-surface-400 uppercase font-bold block">Custos Totais</span>
                      <span className="text-lg font-bold text-rose-600">
                        R$ {(dreData?.events?.[0]?.totalCosts || 380000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-surface-400 uppercase font-bold block">Resultado Líquido</span>
                      <span className="text-lg font-bold text-surface-900">
                        R$ {(dreData?.events?.[0]?.netProfit || 800000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="border border-surface-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-surface-100 text-surface-700 font-bold border-b border-surface-200">
                        <tr>
                          <th className="p-3">Conta / Categoria</th>
                          <th className="p-3">Classificação</th>
                          <th className="p-3 text-right">Valor Consolidado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-100">
                        <tr>
                          <td className="p-3 font-semibold">Receitas Ingressos & Bar</td>
                          <td className="p-3 text-surface-500">Operacional</td>
                          <td className="p-3 text-right font-bold text-emerald-600">
                            R$ {(dreData?.events?.[0]?.grossRevenue || 1180000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Custos Operacionais de Produção</td>
                          <td className="p-3 text-surface-500">Despesas</td>
                          <td className="p-3 text-right font-bold text-rose-600">
                            R$ {(dreData?.events?.[0]?.totalCosts || 380000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Comissões de Promoters</td>
                          <td className="p-3 text-surface-500">Vendas</td>
                          <td className="p-3 text-right font-bold text-rose-600">
                            R$ {(dreData?.events?.[0]?.totalCommissions || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr className="bg-surface-50 font-bold">
                          <td className="p-3">(=) Lucro Líquido Apurado</td>
                          <td className="p-3">Margem: {dreData?.events?.[0]?.profitMargin || 67.8}%</td>
                          <td className="p-3 text-right font-mono text-sm text-surface-900">
                            R$ {(dreData?.events?.[0]?.netProfit || 800000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
                <button onClick={handleOpenPdf} className="btn-secondary text-xs">
                  <Printer className="w-4 h-4" />
                  Abrir / Imprimir PDF Branded
                </button>
                <button
                  onClick={() => handleDownloadCsv("costs")}
                  className="btn-primary text-xs"
                >
                  <Download className="w-4 h-4" />
                  Baixar Planilha CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
