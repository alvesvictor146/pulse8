"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  User,
  Zap,
  ChevronRight,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const MOCK_SCHEDULES = [
  {
    id: "sch-1",
    phase: "setup", // setup | run | teardown
    title: "Entrega e Descarga de Geradores 500kVA",
    description: "Conexão dos quadros QTA na área técnica do palco principal",
    startAt: "08:00",
    endAt: "10:30",
    ownerName: "Roberto Ramos (EletroPower)",
    status: "completed",
    priority: "alta",
  },
  {
    id: "sch-2",
    phase: "setup",
    title: "Passagem de Som e Luz — DJ Headliner",
    description: "Alinhamento das PAs de som e teste de lasers",
    startAt: "14:00",
    endAt: "17:00",
    ownerName: "Carlos Souza (Eng. de Som)",
    status: "in_progress",
    priority: "critica",
  },
  {
    id: "sch-3",
    phase: "run",
    title: "Abertura dos Portões & Início do Credenciamento",
    description: "Equipe de portaria posicionada com leitores PWA em todos os portões",
    startAt: "20:00",
    endAt: "20:30",
    ownerName: "Vanessa Prado (Gestora de Portaria)",
    status: "pending",
    priority: "alta",
  },
  {
    id: "sch-4",
    phase: "run",
    title: "Show de Abertura — DJ Resident",
    description: "Abertura oficial do palco principal",
    startAt: "21:00",
    endAt: "23:00",
    ownerName: "DJ Resident",
    status: "pending",
    priority: "media",
  },
  {
    id: "sch-5",
    phase: "teardown",
    title: "Desmontagem da Estrutura de Som & Iluminação",
    description: "Desconexão dos cabos e recolhimento das estruturas de grid",
    startAt: "08:30",
    endAt: "14:00",
    ownerName: "Equipe Luz & Som Brasil",
    status: "pending",
    priority: "alta",
  },
];

const PHASE_TABS = [
  { id: "all", label: "Todas as Fases" },
  { id: "setup", label: "Montagem (Setup)" },
  { id: "run", label: "Show & Execução" },
  { id: "teardown", label: "Desmontagem" },
];

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  completed: { label: "Concluído", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  in_progress: { label: "Em Andamento", class: "bg-blue-100 text-blue-700 border-blue-200 animate-pulse" },
  pending: { label: "Pendente", class: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function CronogramasPage() {
  const [activePhase, setActivePhase] = useState("all");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    phase: "setup",
    startAt: "",
    endAt: "",
    ownerName: "",
  });

  const loadSchedules = useCallback(async () => {
    if (!selectedEventId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/schedules?eventId=${selectedEventId}`);
      if (res.ok) {
        const d = await res.json();
        setSchedules(d.data ?? d);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => {
        const evs = d.data ?? d;
        setEvents(evs);
        if (evs.length > 0) setSelectedEventId(evs[0].id);
        else setIsLoading(false);
      });
  }, []);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !selectedEventId) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTask, eventId: selectedEventId, status: "pending" }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewTask({ title: "", phase: "setup", startAt: "", endAt: "", ownerName: "" });
        await loadSchedules();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    return activePhase === "all" || s.phase === activePhase;
  });

  return (
    <AppShell title="Cronogramas & Timelines Operacionais" subtitle="Planejamento cronológico de montagem, execução e desmontagem do evento">
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-2 p-1 bg-surface-100 rounded-xl border border-surface-200 overflow-x-auto w-full sm:w-auto">
            {PHASE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePhase(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activePhase === tab.id
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-surface-600 hover:text-surface-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs font-semibold py-2.5"
          >
            <Plus className="w-4 h-4" />
            Adicionar Atividade
          </button>
        </div>

        {/* Timeline Stream */}
        <div className="card p-6 border border-surface-200/80 bg-white shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-surface-100 pb-4">
            <div>
              <h3 className="text-lg font-bold font-display text-surface-900">
                Linha do Tempo — Festival Pulsar 2026
              </h3>
              <p className="text-xs text-surface-500">Marcos operacionais e ordenação por horário</p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              {filteredSchedules.length} marcos listados
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-200">
            {filteredSchedules.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline Dot Indicator */}
                <div
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                    item.status === "completed"
                      ? "bg-emerald-500"
                      : item.status === "in_progress"
                      ? "bg-brand-500 ring-4 ring-brand-100"
                      : "bg-surface-300"
                  }`}
                />

                {/* Card Item */}
                <div className="card p-4 border border-surface-200/80 bg-white hover:border-brand-300 transition-all shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                        {item.startAt} - {item.endAt}
                      </span>
                      <h4 className="font-bold text-surface-900">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          STATUS_CONFIG[item.status]?.class
                        }`}
                      >
                        {STATUS_CONFIG[item.status]?.label}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-surface-500 gap-2">
                    <p className="text-surface-600">{item.description}</p>
                    <div className="flex items-center gap-1.5 font-medium text-surface-700 bg-surface-50 px-2.5 py-1 rounded-md">
                      <User className="w-3.5 h-3.5 text-surface-400" />
                      <span>{item.ownerName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Nova Atividade */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-lg p-6 bg-white border border-surface-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 pb-3">
                <h3 className="text-lg font-bold font-display text-surface-900">Nova Atividade no Cronograma</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Título da Atividade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Passagem de som Banda Principal"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Fase</label>
                    <select
                      value={newTask.phase}
                      onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })}
                      className="input bg-white"
                    >
                      <option value="setup">Montagem (Setup)</option>
                      <option value="run">Show & Execução</option>
                      <option value="teardown">Desmontagem</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Responsável</label>
                    <input
                      type="text"
                      placeholder="Nome do responsável"
                      value={newTask.ownerName}
                      onChange={(e) => setNewTask({ ...newTask, ownerName: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Hora Início</label>
                    <input
                      type="time"
                      value={newTask.startAt}
                      onChange={(e) => setNewTask({ ...newTask, startAt: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Hora Término</label>
                    <input
                      type="time"
                      value={newTask.endAt}
                      onChange={(e) => setNewTask({ ...newTask, endAt: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Adicionar no Cronograma
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
