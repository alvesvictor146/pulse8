"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

interface FeedbackState {
  type: "success" | "error" | "warning";
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export default function NovoEventoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    theme: "",
    venue: "",
    city: "",
    state: "SP",
    capacity: 1000,
    startAt: "",
    endAt: "",
    status: "draft",
    coverUrl: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Sucesso real no banco de dados
        setFeedback({
          type: "success",
          title: "Evento Salvo com Sucesso!",
          message: `O evento "${formData.name}" foi registrado e já está disponível na listagem geral. Redirecionando...`,
        });

        // Salvar cópia no cache local de homologação para garantia imediata na interface
        try {
          const localEvents = JSON.parse(localStorage.getItem("pulse8_custom_events") || "[]");
          localEvents.unshift({
            ...formData,
            id: data.id || `evt-local-${Date.now()}`,
            ticketsSold: 0,
            budgetPlanned: 0,
            budgetActual: 0,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem("pulse8_custom_events", JSON.stringify(localEvents));
        } catch (_) {}

        setTimeout(() => {
          router.push("/eventos");
        }, 1800);
      } else if (res.status === 401) {
        // Falta de autenticação de sessão ativa
        // Salva no localStorage para não travar o cliente em homologação
        try {
          const localEvents = JSON.parse(localStorage.getItem("pulse8_custom_events") || "[]");
          localEvents.unshift({
            ...formData,
            id: `evt-local-${Date.now()}`,
            ticketsSold: 0,
            budgetPlanned: 0,
            budgetActual: 0,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem("pulse8_custom_events", JSON.stringify(localEvents));
        } catch (_) {}

        setFeedback({
          type: "warning",
          title: "Salvo em Modo Demonstração (Sem Login Ativo)",
          message: `O evento "${formData.name}" foi salvo localmente para visualização imediata no painel. Para gravar no banco multi-tenant permanente, faça login como administrador.`,
          actionUrl: "/eventos",
          actionLabel: "Ver na Lista de Eventos",
        });
      } else {
        // Erro de validação ou servidor
        const errorMsg =
          data.error ||
          (data.details ? JSON.stringify(data.details) : "Falha ao salvar evento no servidor.");
        setFeedback({
          type: "error",
          title: "Não foi possível salvar o evento",
          message: errorMsg,
        });
      }
    } catch (err) {
      // Fallback de contingência: salva em cache e avisa
      try {
        const localEvents = JSON.parse(localStorage.getItem("pulse8_custom_events") || "[]");
        localEvents.unshift({
          ...formData,
          id: `evt-local-${Date.now()}`,
          ticketsSold: 0,
          budgetPlanned: 0,
          budgetActual: 0,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("pulse8_custom_events", JSON.stringify(localEvents));
      } catch (_) {}

      setFeedback({
        type: "warning",
        title: "Evento Armazenado Localmente",
        message: `Houve instabilidade de conexão com a API, mas salvamos "${formData.name}" no seu navegador para que você possa visualizá-lo na lista.`,
        actionUrl: "/eventos",
        actionLabel: "Ir para a Lista de Eventos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell title="Novo Evento" subtitle="Cadastre as informações gerais do evento">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/eventos"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Lista de Eventos
        </Link>

        {/* Feedback Card (Success / Warning / Error) */}
        {feedback && (
          <div
            className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : feedback.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-rose-50 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                  feedback.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : feedback.type === "warning"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                ) : feedback.type === "warning" ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <div className="font-bold font-display text-base flex items-center gap-2">
                  {feedback.title}
                  {feedback.type === "success" && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-bold">
                      Salvo com Sucesso
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-90 leading-relaxed max-w-2xl">
                  {feedback.message}
                </p>
              </div>
            </div>

            {feedback.actionUrl && (
              <Link
                href={feedback.actionUrl}
                className={`btn text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 flex-shrink-0 transition-all shadow-sm ${
                  feedback.type === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-brand-600 hover:bg-brand-700 text-white"
                }`}
              >
                {feedback.actionLabel || "Continuar"}
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* Form Card */}
        <div className="card p-8 border border-surface-200/80 bg-white shadow-sm rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-surface-900 border-b border-surface-100 pb-3">
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="name" className="text-sm font-medium text-surface-700">
                    Nome do Evento *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Ex: Festival Pulsar 2026"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="theme" className="text-sm font-medium text-surface-700">
                    Tema / Gênero Musical
                  </label>
                  <input
                    id="theme"
                    name="theme"
                    type="text"
                    placeholder="Ex: Música Eletrônica & Arte Visual"
                    value={formData.theme}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="status" className="text-sm font-medium text-surface-700">
                    Status Inicial *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input bg-white"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="planning">Planejamento</option>
                    <option value="in_sales">Em Vendas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dates & Capacity */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold font-display text-surface-900 border-b border-surface-100 pb-3">
                Datas & Capacidade
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="startAt" className="text-sm font-medium text-surface-700">
                    Data / Hora de Início *
                  </label>
                  <input
                    id="startAt"
                    name="startAt"
                    type="datetime-local"
                    required
                    value={formData.startAt}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="endAt" className="text-sm font-medium text-surface-700">
                    Data / Hora de Término
                  </label>
                  <input
                    id="endAt"
                    name="endAt"
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="capacity" className="text-sm font-medium text-surface-700">
                    Capacidade Total (Pessoas) *
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min={1}
                    required
                    value={formData.capacity}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold font-display text-surface-900 border-b border-surface-100 pb-3">
                Localização
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="venue" className="text-sm font-medium text-surface-700">
                    Nome do Local / Arena
                  </label>
                  <input
                    id="venue"
                    name="venue"
                    type="text"
                    placeholder="Ex: Arena Anhembi"
                    value={formData.venue}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-sm font-medium text-surface-700">
                    Cidade / UF
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="São Paulo"
                      value={formData.city}
                      onChange={handleChange}
                      className="input flex-1"
                    />
                    <input
                      id="state"
                      name="state"
                      type="text"
                      placeholder="SP"
                      maxLength={2}
                      value={formData.state}
                      onChange={handleChange}
                      className="input w-16 uppercase text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold font-display text-surface-900 border-b border-surface-100 pb-3">
                Imagem de Capa
              </h3>

              <div className="space-y-1.5">
                <label htmlFor="coverUrl" className="text-sm font-medium text-surface-700">
                  URL da Imagem de Capa / Poster
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    id="coverUrl"
                    name="coverUrl"
                    type="url"
                    placeholder="https://exemplo.com/imagem-evento.jpg"
                    value={formData.coverUrl}
                    onChange={handleChange}
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end gap-3 border-t border-surface-100">
              <Link href="/eventos" className="btn-secondary">
                Cancelar
              </Link>
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Cadastrar Evento
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
