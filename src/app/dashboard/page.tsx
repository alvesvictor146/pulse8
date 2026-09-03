"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  CalendarDays,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  ArrowRight,
  MoreHorizontal,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ── Fallback Mock Data ── */
const revenueData = [
  { month: "Jan", receita: 45000, despesa: 32000 },
  { month: "Fev", receita: 52000, despesa: 38000 },
  { month: "Mar", receita: 48000, despesa: 35000 },
  { month: "Abr", receita: 61000, despesa: 40000 },
  { month: "Mai", receita: 55000, despesa: 37000 },
  { month: "Jun", receita: 72000, despesa: 45000 },
  { month: "Jul", receita: 78000, despesa: 48000 },
  { month: "Ago", receita: 85000, despesa: 52000 },
];

const ticketChannels = [
  { name: "Sympla", value: 4200, color: "#4c6ef5" },
  { name: "Promoters", value: 2800, color: "#10b981" },
  { name: "Bilheteria", value: 1200, color: "#f59e0b" },
  { name: "Cortesia", value: 400, color: "#a0aec0" },
];

const upcomingEvents = [
  {
    id: 1,
    name: "Festival Pulse Summer 2026",
    date: "12 Set 2026",
    venue: "Arena BH",
    city: "Belo Horizonte, MG",
    capacity: 5000,
    sold: 3750,
    status: "Em Vendas",
    statusColor: "badge-success",
  },
  {
    id: 2,
    name: "Pulse8 Sunset Sessions",
    date: "28 Set 2026",
    venue: "Rooftop Sky",
    city: "São Paulo, SP",
    capacity: 800,
    sold: 620,
    status: "Pré-produção",
    statusColor: "badge-info",
  },
  {
    id: 3,
    name: "Halloween Pulse Edition",
    date: "31 Out 2026",
    venue: "Galpão 7",
    city: "Rio de Janeiro, RJ",
    capacity: 3000,
    sold: 450,
    status: "Planejamento",
    statusColor: "badge-warning",
  },
];

const recentActivities = [
  {
    id: 1,
    user: "Maria S.",
    action: 'Aprovou despesa "Locação de Palco"',
    time: "há 12 min",
    icon: CheckCircle2,
    iconColor: "text-success-500",
  },
  {
    id: 2,
    user: "João P.",
    action: "Agendou post para Instagram",
    time: "há 34 min",
    icon: Megaphone,
    iconColor: "text-brand-500",
  },
  {
    id: 3,
    user: "Carlos R.",
    action: "Importou 320 vendas do Sympla",
    time: "há 1h",
    icon: TrendingUp,
    iconColor: "text-info-500",
  },
  {
    id: 4,
    user: "Ana L.",
    action: 'Adicionou promoter "Felipe M." à campanha',
    time: "há 2h",
    icon: UserCheck,
    iconColor: "text-warning-500",
  },
  {
    id: 5,
    user: "Sistema",
    action: "Alerta: 3 despesas vencem amanhã",
    time: "há 3h",
    icon: AlertCircle,
    iconColor: "text-danger-500",
  },
];

const topPromoters = [
  { name: "Felipe M.", sales: 182, revenue: 18200, avatar: "FM" },
  { name: "Juliana C.", sales: 156, revenue: 15600, avatar: "JC" },
  { name: "Rafael S.", sales: 134, revenue: 13400, avatar: "RS" },
  { name: "Beatriz A.", sales: 98, revenue: 9800, avatar: "BA" },
];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadKPIs() {
      try {
        const res = await fetch("/api/dashboard/kpis");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          if (data.recentEvents && data.recentEvents.length > 0) {
            setEventsList(data.recentEvents);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch KPIs, using defaults:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadKPIs();
  }, []);

  const totalRev = metrics?.totalRevenue ?? 496000;
  const totalSold = metrics?.totalTicketsSold ?? 8620;
  const activeEvents = metrics?.activeEventsCount ?? 12;

  return (
    <AppShell title="Dashboard Geral" subtitle="Visão panorâmica da operação em tempo real">
      <div className="space-y-6">
        {/* ── Filter & Action Controls ── */}
        <div className="flex justify-end items-center gap-3">
          <select className="input py-2 px-3 w-auto text-sm bg-white shadow-xs">
            <option>Últimos 30 dias</option>
            <option>Últimos 7 dias</option>
            <option>Este mês</option>
            <option>Este ano</option>
          </select>
          <a href="/eventos/novo" className="btn-primary py-2 text-sm shadow-xs">
            <CalendarDays className="w-4 h-4" />
            Novo Evento
          </a>
        </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Eventos Ativos"
          value={isLoading ? "..." : String(activeEvents)}
          change={20}
          icon={CalendarDays}
          iconBg="bg-brand-50"
          iconColor="text-brand-600"
        />
        <StatCard
          title="Receita Total"
          value={isLoading ? "..." : `R$ ${totalRev.toLocaleString("pt-BR")}`}
          change={14.3}
          icon={DollarSign}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
        <StatCard
          title="Ingressos Vendidos"
          value={isLoading ? "..." : totalSold.toLocaleString("pt-BR")}
          change={8.7}
          icon={TrendingUp}
          iconBg="bg-info-50"
          iconColor="text-info-600"
        />
        <StatCard
          title="Equipe Ativa"
          value="86"
          change={-2.1}
          icon={Users}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="card col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-surface-800">
                Receita vs Despesas
              </h3>
              <p className="text-xs text-surface-400 mt-0.5">
                Comparativo mensal 2026
              </p>
            </div>
            <button className="btn-ghost btn-sm">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf2" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#718096" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#718096" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e8ebf2",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value)
                }
              />
              <Bar
                dataKey="receita"
                fill="#4c6ef5"
                radius={[6, 6, 0, 0]}
                name="Receita"
              />
              <Bar
                dataKey="despesa"
                fill="#e8ebf2"
                radius={[6, 6, 0, 0]}
                name="Despesa"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket Channels Pie */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-surface-800">Canais de Venda</h3>
              <p className="text-xs text-surface-400 mt-0.5">
                Distribuição de ingressos
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={ticketChannels}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {ticketChannels.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e8ebf2",
                  fontSize: "13px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {ticketChannels.map((ch) => (
              <div key={ch.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ch.color }}
                  />
                  <span className="text-surface-600">{ch.name}</span>
                </div>
                <span className="font-semibold text-surface-800">
                  {ch.value.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Events & Activities Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upcoming Events */}
        <div className="card col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-surface-800">Próximos Eventos</h3>
              <p className="text-xs text-surface-400 mt-0.5">
                Seus eventos futuros mais próximos
              </p>
            </div>
            <button className="btn-ghost btn-sm">
              Ver todos
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-surface-100">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="px-5 py-4 flex items-center gap-4 hover:bg-surface-50 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex flex-col items-center justify-center shrink-0">
                  <span className="text-2xs font-bold text-brand-600 leading-none">
                    {event.date.split(" ")[0]}
                  </span>
                  <span className="text-2xs text-brand-400 leading-none mt-0.5">
                    {event.date.split(" ")[1]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-surface-800 truncate group-hover:text-brand-600 transition-colors">
                      {event.name}
                    </p>
                    <span className={event.statusColor}>{event.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-surface-400">
                      <MapPin className="w-3 h-3" />
                      {event.venue} · {event.city}
                    </span>
                  </div>
                </div>
                <div className="w-32 shrink-0">
                  <ProgressBar
                    value={event.sold}
                    max={event.capacity}
                    label={`${event.sold}/${event.capacity}`}
                    size="sm"
                    color={
                      event.sold / event.capacity > 0.8
                        ? "success"
                        : event.sold / event.capacity > 0.5
                        ? "brand"
                        : "warning"
                    }
                  />
                </div>
                <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-brand-500 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-surface-800">Atividade Recente</h3>
            <p className="text-xs text-surface-400 mt-0.5">
              Últimas ações do time
            </p>
          </div>
          <div className="divide-y divide-surface-100">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="px-5 py-3.5 flex items-start gap-3"
              >
                <div className="mt-0.5">
                  <activity.icon
                    className={`w-4 h-4 ${activity.iconColor}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-700">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-2xs text-surface-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top Promoters Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Promoters */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-surface-800">Top Promoters</h3>
              <p className="text-xs text-surface-400 mt-0.5">
                Ranking de vendas do mês
              </p>
            </div>
            <button className="btn-ghost btn-sm">Ver todos</button>
          </div>
          <div className="space-y-3">
            {topPromoters.map((promoter, idx) => (
              <div
                key={promoter.name}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors"
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    idx === 0
                      ? "bg-warning-100 text-warning-700"
                      : idx === 1
                      ? "bg-surface-200 text-surface-600"
                      : idx === 2
                      ? "bg-warning-50 text-warning-600"
                      : "bg-surface-100 text-surface-500"
                  }`}
                >
                  {idx + 1}º
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-xs font-bold text-white">
                  {promoter.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800">
                    {promoter.name}
                  </p>
                  <p className="text-2xs text-surface-400">
                    {promoter.sales} vendas
                  </p>
                </div>
                <span className="text-sm font-bold text-surface-800">
                  R$ {promoter.revenue.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Orçamento Overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-surface-800">
                Resumo Orçamentário
              </h3>
              <p className="text-xs text-surface-400 mt-0.5">
                Festival Pulse Summer 2026
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-600">Orçamento Total</span>
              <span className="text-lg font-bold text-surface-800">
                R$ 180.000
              </span>
            </div>
            <ProgressBar
              value={124500}
              max={180000}
              label="Executado"
              color="brand"
              size="lg"
            />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-success-50 border border-success-100">
                <p className="text-2xs text-success-600 font-medium">
                  Receitas
                </p>
                <p className="text-lg font-bold text-success-700 mt-1">
                  R$ 285.000
                </p>
              </div>
              <div className="p-3 rounded-xl bg-danger-50 border border-danger-100">
                <p className="text-2xs text-danger-600 font-medium">Despesas</p>
                <p className="text-lg font-bold text-danger-700 mt-1">
                  R$ 124.500
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-surface-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-surface-600">
                  Lucro Estimado
                </span>
                <span className="text-lg font-bold text-success-600">
                  R$ 160.500
                </span>
              </div>
              <p className="text-2xs text-surface-400 mt-1">
                ROI: 89,2% · Custo por pessoa: R$ 24,90
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
