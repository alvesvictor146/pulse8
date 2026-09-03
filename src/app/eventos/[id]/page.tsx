"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Ticket,
  Layers,
  Plus,
  Edit,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

export default function EventoDetalhesPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [activeTab, setActiveTab] = useState<"overview" | "areas" | "tickets" | "finance">("overview");

  // Mock Event State
  const [event] = useState({
    id: eventId,
    name: "Festival Pulsar 2026",
    theme: "Música Eletrônica & Arte Visual",
    venue: "Arena Anhembi",
    city: "São Paulo",
    state: "SP",
    capacity: 15000,
    startAt: "2026-11-14T20:00:00",
    endAt: "2026-11-15T08:00:00",
    status: "in_sales",
    coverUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
    budgetPlanned: 450000,
    budgetActual: 380000,
  });

  const [areas, setAreas] = useState([
    { id: "a-1", name: "Pista Premium", capacity: 8000, accessLevel: "Geral" },
    { id: "a-2", name: "Camarote VIP Frontstage", capacity: 4000, accessLevel: "VIP" },
    { id: "a-3", name: "Backstage & Open Bar", capacity: 3000, accessLevel: "Artist/Staff" },
  ]);

  const [tickets, setTickets] = useState([
    { id: "t-1", areaName: "Pista Premium", lot: "1º Lote", price: 120, qtyTotal: 4000, qtySold: 4000 },
    { id: "t-2", areaName: "Pista Premium", lot: "2º Lote", price: 160, qtyTotal: 4000, qtySold: 2450 },
    { id: "t-3", areaName: "Camarote VIP Frontstage", lot: "1º Lote", price: 350, qtyTotal: 2000, qtySold: 2000 },
  ]);

  return (
    <AppShell title={event.name} subtitle={`${event.venue} · ${event.city}/${event.state}`}>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/eventos"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Lista de Eventos
        </Link>

        {/* Hero Card */}
        <div className="card overflow-hidden border border-surface-200/80 bg-white shadow-sm">
          <div className="relative h-48 sm:h-64 w-full bg-surface-950">
            <img
              src={event.coverUrl}
              alt=""
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                  EM VENDAS
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-2">
                  {event.name}
                </h1>
                <p className="text-sm text-surface-300 mt-1">{event.theme}</p>
              </div>

              <div className="flex gap-2">
                <button className="btn-secondary py-2 text-xs font-semibold bg-white/10 text-white hover:bg-white/20 border-white/20">
                  <Edit className="w-3.5 h-3.5" />
                  Editar Evento
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-surface-100 bg-surface-50/50">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-surface-500 font-medium">Lotação Esperada</div>
                <div className="text-lg font-bold text-surface-900">{event.capacity.toLocaleString()} pessoas</div>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-surface-500 font-medium">Ingressos Vendidos</div>
                <div className="text-lg font-bold text-surface-900">8.450 (56%)</div>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-surface-500 font-medium">Receita Bruta</div>
                <div className="text-lg font-bold text-emerald-600">R$ 1.180.000</div>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-surface-500 font-medium">Orçamento Consumido</div>
                <div className="text-lg font-bold text-surface-900">R$ 380.000 / R$ 450k</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Control */}
        <div className="border-b border-surface-200">
          <nav className="flex gap-6 text-sm font-semibold">
            {[
              { id: "overview", label: "Visão Geral" },
              { id: "areas", label: "Áreas & Setores" },
              { id: "tickets", label: "Lotes de Ingressos" },
              { id: "finance", label: "Resumo Financeiro" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-surface-500 hover:text-surface-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6 border border-surface-200/80 bg-white space-y-4">
              <h3 className="text-lg font-bold font-display text-surface-900">Detalhes do Evento</h3>
              <p className="text-sm text-surface-600 leading-relaxed">
                O Festival Pulsar 2026 reúne os maiores nomes da música eletrônica nacional e internacional com cenografia imersiva de projeções mapeadas.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-100 text-sm">
                <div>
                  <span className="text-surface-400 block text-xs">Início</span>
                  <span className="font-semibold text-surface-900">14/11/2026 às 20:00</span>
                </div>
                <div>
                  <span className="text-surface-400 block text-xs">Término</span>
                  <span className="font-semibold text-surface-900">15/11/2026 às 08:00</span>
                </div>
              </div>
            </div>

            <div className="card p-6 border border-surface-200/80 bg-white space-y-4">
              <h3 className="text-lg font-bold font-display text-surface-900">Atalhos Operacionais</h3>
              <div className="space-y-2">
                <Link href="/convidados" className="btn-secondary w-full justify-start py-2.5 text-xs font-semibold">
                  <Users className="w-4 h-4 text-brand-600" />
                  Gerenciar Listas VIP
                </Link>
                <Link href="/financeiro" className="btn-secondary w-full justify-start py-2.5 text-xs font-semibold">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Abrir DRE & Custos
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "areas" && (
          <div className="card p-6 border border-surface-200/80 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-surface-900">Áreas do Local</h3>
              <button className="btn-primary py-2 text-xs">
                <Plus className="w-4 h-4" />
                Adicionar Área
              </button>
            </div>
            <div className="divide-y divide-surface-100">
              {areas.map((area) => (
                <div key={area.id} className="py-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-surface-900">{area.name}</div>
                    <div className="text-xs text-surface-500">Nível de Acesso: {area.accessLevel}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-surface-900">{area.capacity.toLocaleString()} pessoas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="card p-6 border border-surface-200/80 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-surface-900">Lotes de Ingressos</h3>
              <button className="btn-primary py-2 text-xs">
                <Plus className="w-4 h-4" />
                Novo Lote
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm divide-y divide-surface-100">
                <thead className="bg-surface-50 text-surface-500 font-medium">
                  <tr>
                    <th className="p-3">Setor</th>
                    <th className="p-3">Lote</th>
                    <th className="p-3">Preço Unitário</th>
                    <th className="p-3">Vendas</th>
                    <th className="p-3 text-right">Faturamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td className="p-3 font-semibold text-surface-900">{t.areaName}</td>
                      <td className="p-3 text-surface-600">{t.lot}</td>
                      <td className="p-3 font-medium text-surface-900">R$ {t.price.toFixed(2)}</td>
                      <td className="p-3">{t.qtySold} / {t.qtyTotal}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">R$ {(t.price * t.qtySold).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "finance" && (
          <div className="card p-6 border border-surface-200/80 bg-white space-y-4">
            <h3 className="text-lg font-bold font-display text-surface-900">Demonstrativo Sintético (DRE)</h3>
            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-surface-600 font-medium">Receita Bruta (Ingressos + Bar)</span>
                <span className="font-bold text-emerald-600">R$ 1.180.000,00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-surface-600 font-medium">Custos Fixos (Estrutura, Som, Segurança)</span>
                <span className="font-bold text-rose-600">- R$ 250.000,00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-surface-600 font-medium">Custos Variáveis & Taxas</span>
                <span className="font-bold text-rose-600">- R$ 130.000,00</span>
              </div>
              <div className="flex justify-between py-3 bg-surface-50 px-4 rounded-xl font-bold text-base">
                <span className="text-surface-900">Resultado Líquido Estimado</span>
                <span className="text-emerald-600">R$ 800.000,00</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
