"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import {
  Megaphone,
  Image as ImageIcon,
  Calendar,
  Share2,
  Plus,
  Upload,
  Clock,
  CheckCircle2,
  Instagram,
  Facebook,
  Linkedin,
  Eye,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const MOCK_ASSETS = [
  { id: "ast-1", name: "Poster_Oficial_Festival2026.psd", type: "PSD", size: "145 MB", format: "Banner", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop" },
  { id: "ast-2", name: "Lineup_Fase1_Feed.jpg", type: "JPG", size: "4.2 MB", format: "Feed 1:1", url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop" },
  { id: "ast-3", name: "Teaser_Teaser_Stories.mp4", type: "MP4", size: "28.5 MB", format: "Stories 9:16", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop" },
  { id: "ast-4", name: "Mapa_Setores_VIP.png", type: "PNG", size: "8.1 MB", format: "Feed 1:1", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop" },
];

const MOCK_POSTS = [
  {
    id: "pst-1",
    platform: "instagram",
    title: "Anúncio do Lineup Fase 1",
    copy: "Prepare-se! Os primeiros artistas do Festival Pulsar 2026 estão confirmados. Marque seus amigos nos comentários e garanta seu lote promo! 🚀⚡ #FestivalPulsar #Pulse8",
    scheduledAt: "2026-10-10T18:00:00",
    status: "scheduled",
    assetUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "pst-2",
    platform: "facebook",
    title: "Aviso de Virada de Lote",
    copy: "Últimas 24 horas para garantir seu ingresso de 1º Lote com preço promocional! Acesse o link na bio.",
    scheduledAt: "2026-09-30T12:00:00",
    status: "scheduled",
    assetUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
  },
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"assets" | "queue">("assets");
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newPost, setNewPost] = useState({
    platform: "instagram",
    title: "",
    copy: "",
    scheduledAt: "",
  });

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const eventId = selectedEventId ? `?eventId=${selectedEventId}` : "";
      const res = await fetch(`/api/marketing/posts${eventId}`);
      if (res.ok) {
        const d = await res.json();
        setPosts(d.data ?? d);
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

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title) return;
    const eventId = selectedEventId || events[0]?.id;
    if (!eventId) { alert("Selecione um evento"); return; }
    setIsSaving(true);
    try {
      const res = await fetch("/api/marketing/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPost, eventId, status: "scheduled" }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewPost({ platform: "instagram", title: "", copy: "", scheduledAt: "" });
        await loadPosts();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell title="Marketing & Social Media" subtitle="Repositório de ativos digitais (Assets R2) e agendamento de postagens com pré-visualização">
      <div className="space-y-6">
        {/* Controls & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-200 pb-4">
          <div className="flex gap-6 text-sm font-semibold">
            <button
              onClick={() => setActiveTab("assets")}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === "assets"
                  ? "border-brand-600 text-brand-600 font-bold"
                  : "border-transparent text-surface-500 hover:text-surface-900"
              }`}
            >
              Biblioteca de Ativos (Assets R2)
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === "queue"
                  ? "border-brand-600 text-brand-600 font-bold"
                  : "border-transparent text-surface-500 hover:text-surface-900"
              }`}
            >
              Agendador de Posts (Social Queue)
            </button>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs font-semibold py-2.5">
            <Plus className="w-4 h-4" />
            {activeTab === "assets" ? "Upload de Novo Criativo" : "Agendar Novo Post"}
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === "assets" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {MOCK_ASSETS.map((ast) => (
              <div key={ast.id} className="card overflow-hidden border border-surface-200/80 bg-white hover:shadow-md transition-all group">
                <div className="relative h-44 bg-surface-900 overflow-hidden">
                  <img src={ast.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-2xs font-bold bg-black/60 text-white backdrop-blur-sm">
                    {ast.type}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="font-bold text-sm text-surface-900 truncate" title={ast.name}>{ast.name}</div>
                  <div className="flex justify-between text-xs text-surface-400">
                    <span>{ast.format}</span>
                    <span>{ast.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="card p-6 border border-surface-200/80 bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-surface-100 pb-3">
                  <div className="flex items-center gap-2">
                    {post.platform === "instagram" ? (
                      <Instagram className="w-5 h-5 text-pink-600" />
                    ) : (
                      <Facebook className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="font-bold text-surface-900">{post.title}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Agendado
                  </span>
                </div>

                <div className="flex gap-4">
                  <img src={post.assetUrl} alt="" className="w-24 h-24 rounded-xl object-cover border border-surface-100 flex-shrink-0" />
                  <p className="text-xs text-surface-600 leading-relaxed line-clamp-4">{post.copy}</p>
                </div>

                <div className="pt-2 text-xs text-surface-400 flex items-center justify-between border-t border-surface-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Publicação: {new Date(post.scheduledAt).toLocaleString("pt-BR")}</span>
                  </div>
                  <button className="text-brand-600 font-semibold hover:underline">Ver Preview</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Agendar Post */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-lg p-6 bg-white border border-surface-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 pb-3">
                <h3 className="text-lg font-bold font-display text-surface-900">Agendar Publicação Social</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPost} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Rede Social</label>
                  <select
                    value={newPost.platform}
                    onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                    className="input bg-white"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Título da Campanha *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Anúncio do Lineup 2026"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Legenda / Copy</label>
                  <textarea
                    rows={3}
                    placeholder="Digite o texto da postagem..."
                    value={newPost.copy}
                    onChange={(e) => setNewPost({ ...newPost, copy: e.target.value })}
                    className="input resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Data e Hora da Publicação</label>
                  <input
                    type="datetime-local"
                    value={newPost.scheduledAt}
                    onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Agendar Post
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
