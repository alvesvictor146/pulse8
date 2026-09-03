"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  MoreVertical,
  DollarSign,
  Ticket,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

// Realistic Mock Data for Events
const INITIAL_EVENTS = [
  {
    id: "evt-1",
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
    ticketsSold: 8450,
    budgetPlanned: 450000,
    budgetActual: 380000,
  },
  {
    id: "evt-2",
    name: "Sunset Club Sunset Edition",
    theme: "Deep House & Beach Vibes",
    venue: "Beach Club Guaruja",
    city: "Guarujá",
    state: "SP",
    capacity: 3500,
    startAt: "2026-10-03T16:00:00",
    endAt: "2026-10-04T02:00:00",
    status: "planning",
    coverUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
    ticketsSold: 1200,
    budgetPlanned: 120000,
    budgetActual: 45000,
  },
  {
    id: "evt-3",
    name: "Baile da Favorita - Edição Especial",
    theme: "Funk & Hip-Hop Premium",
    venue: "Espaço das Américas",
    city: "São Paulo",
    state: "SP",
    capacity: 8000,
    startAt: "2026-12-05T22:00:00",
    endAt: "2026-12-06T06:00:00",
    status: "draft",
    coverUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
    ticketsSold: 0,
    budgetPlanned: 250000,
    budgetActual: 10000,
  },
  {
    id: "evt-4",
    name: "Winter Music Conference",
    theme: "Painéis, Networking & Festival",
    venue: "Centro de Convenções Rebouças",
    city: "São Paulo",
    state: "SP",
    capacity: 5000,
    startAt: "2026-07-20T09:00:00",
    endAt: "2026-07-22T22:00:00",
    status: "closed",
    coverUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop",
    ticketsSold: 4950,
    budgetPlanned: 180000,
    budgetActual: 175000,
  },
];

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  draft: { label: "Rascunho", class: "bg-surface-100 text-surface-700 border-surface-200" },
  planning: { label: "Planejamento", class: "bg-amber-50 text-amber-700 border-amber-200" },
  in_sales: { label: "Em Vendas", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Encerrado", class: "bg-purple-50 text-purple-700 border-purple-200" },
};

export default function EventosPage() {
  const [events, setEvents] = useState<any[]>(INITIAL_EVENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadEvents() {
      try {
        let combined = [...INITIAL_EVENTS];

        // 1. Carregar do localStorage caso tenha sido criado nesta sessão/navegador
        try {
          const localEvents = JSON.parse(localStorage.getItem("pulse8_custom_events") || "[]");
          if (Array.isArray(localEvents) && localEvents.length > 0) {
            combined = [...localEvents, ...combined];
          }
        } catch (_) {}

        // 2. Carregar da API real do Prisma
        const res = await fetch("/api/events");
        if (res.ok) {
          const apiEvents = await res.json();
          if (Array.isArray(apiEvents) && apiEvents.length > 0) {
            const normalized = apiEvents.map((e: any) => ({
              id: e.id,
              name: e.name,
              theme: e.theme || "Geral",
              venue: e.venue || "A Definir",
              city: e.city || "São Paulo",
              state: e.state || "SP",
              capacity: e.capacity || 1000,
              startAt: e.startAt || new Date().toISOString(),
              endAt: e.endAt || new Date().toISOString(),
              status: e.status || "draft",
              coverUrl:
                e.coverUrl ||
                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
              ticketsSold:
                e.tickets?.reduce((acc: number, t: any) => acc + (t.soldCount || 0), 0) || 0,
              budgetPlanned: 0,
              budgetActual: 0,
            }));

            // Evitar duplicatas por ID
            const existingIds = new Set(normalized.map((n: any) => n.id));
            const remaining = combined.filter((c) => !existingIds.has(c.id));
            combined = [...normalized, ...remaining];
          }
        }

        setEvents(combined);
      } catch (err) {
        console.warn("Usando eventos locais de homologação:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, []);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      (evt.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (evt.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell title="Gestão de Eventos" subtitle="Gerencie todos os seus eventos, áreas e lotes de ingressos">
      <div className="space-y-6">
        {/* Header & Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar evento por nome ou cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-surface-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input text-sm py-2 bg-white"
              >
                <option value="all">Todos os Status</option>
                <option value="in_sales">Em Vendas</option>
                <option value="planning">Planejamento</option>
                <option value="draft">Rascunho</option>
                <option value="closed">Encerrado</option>
              </select>
            </div>
          </div>

          {/* Actions & View Switcher */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center p-1 bg-surface-100 rounded-lg border border-surface-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-surface-500 hover:text-surface-900"
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-surface-500 hover:text-surface-900"
                }`}
                title="Visualização em Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Link href="/eventos/novo" className="btn-primary">
              <Plus className="w-4 h-4" />
              Criar Novo Evento
            </Link>
          </div>
        </div>

        {/* Content Display */}
        {filteredEvents.length === 0 ? (
          <div className="card p-12 text-center space-y-4">
            <Calendar className="w-12 h-12 text-surface-300 mx-auto" />
            <h3 className="text-lg font-bold text-surface-900">Nenhum evento encontrado</h3>
            <p className="text-sm text-surface-500 max-w-sm mx-auto">
              Tente alterar os termos da busca ou os filtros aplicados.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="card group overflow-hidden border border-surface-200/80 bg-white hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-surface-900">
                  <img
                    src={evt.coverUrl}
                    alt={evt.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Status Badge */}
                  <span
                    className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      STATUS_MAP[evt.status]?.class
                    }`}
                  >
                    {STATUS_MAP[evt.status]?.label}
                  </span>

                  {/* Title on Image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold font-display text-white drop-shadow-md">
                      {evt.name}
                    </h3>
                    <p className="text-xs text-surface-300 mt-0.5 line-clamp-1">{evt.theme}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5 text-sm text-surface-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>
                        {evt.startAt
                          ? new Date(evt.startAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Data a definir"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span className="truncate">
                        {evt.venue || "A Definir"} · {evt.city || "São Paulo"}/{evt.state || "SP"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>
                        Capacidade: <strong>{(evt.capacity || 0).toLocaleString()} pessoas</strong>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (Tickets Sold) */}
                  <div className="space-y-1.5 pt-2 border-t border-surface-100">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-surface-500">Ingressos Vendidos</span>
                      <span className="text-surface-900 font-bold">
                        {(evt.ticketsSold || 0).toLocaleString()} / {(evt.capacity || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(((evt.ticketsSold || 0) / (evt.capacity || 1)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer Action */}
                  <Link
                    href={`/eventos/${evt.id}`}
                    className="btn-secondary w-full justify-between mt-2 py-2 text-sm font-semibold group-hover:border-brand-300"
                  >
                    Gerenciar Evento
                    <ChevronRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="card overflow-hidden border border-surface-200/80 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-medium">
                  <tr>
                    <th className="p-4">Evento</th>
                    <th className="p-4">Data & Horário</th>
                    <th className="p-4">Local</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Vendas</th>
                    <th className="p-4">Orçamento</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="p-4 font-semibold text-surface-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.coverUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-surface-100 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-surface-900">{evt.name}</div>
                            <div className="text-xs text-surface-400">{evt.theme}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-surface-600">
                        {evt.startAt
                          ? new Date(evt.startAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "A definir"}
                      </td>
                      <td className="p-4 text-surface-600">
                        {evt.city || "São Paulo"}/{evt.state || "SP"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            STATUS_MAP[evt.status]?.class || "bg-surface-100 text-surface-700"
                          }`}
                        >
                          {STATUS_MAP[evt.status]?.label || evt.status}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-surface-900">
                        {(evt.ticketsSold || 0).toLocaleString()} (
                        {Math.round(((evt.ticketsSold || 0) / (evt.capacity || 1)) * 100)}%)
                      </td>
                      <td className="p-4 text-surface-700 font-medium">
                        R$ {(evt.budgetPlanned || 0).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/eventos/${evt.id}`}
                          className="btn-secondary py-1.5 px-3 text-xs font-semibold"
                        >
                          Gerenciar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
