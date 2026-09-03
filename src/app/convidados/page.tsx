"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  QrCode,
  CheckCircle2,
  Clock,
  UserCheck,
  Download,
  Upload,
  X,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const MOCK_GUESTS = [
  {
    id: "g-1",
    fullName: "Fernanda Lima de Oliveira",
    email: "fernanda.lima@email.com",
    phone: "(11) 98765-4321",
    listName: "Lista VIP Frontstage",
    event: "Festival Pulsar 2026",
    status: "checked_in",
    checkedInAt: "2026-11-14T21:45:00",
    qrCode: "P8:G1:EVT1:8F9A2B",
  },
  {
    id: "g-2",
    fullName: "Gabriel Mendonça Santos",
    email: "gabriel.m@agencia.com",
    phone: "(11) 99887-6655",
    listName: "Imprensa & Influencers",
    event: "Festival Pulsar 2026",
    status: "confirmed",
    checkedInAt: null,
    qrCode: "P8:G2:EVT1:7E3C1D",
  },
  {
    id: "g-3",
    fullName: "Juliana Paes Cavalcanti",
    email: "juliana.paes@email.com",
    phone: "(21) 97654-3210",
    listName: "Artistas & DJ Backstage",
    event: "Festival Pulsar 2026",
    status: "checked_in",
    checkedInAt: "2026-11-14T22:10:00",
    qrCode: "P8:G3:EVT1:1A4B9C",
  },
  {
    id: "g-4",
    fullName: "Lucas Rodrigues Silva",
    email: "lucas.rodrigues@email.com",
    phone: "(11) 96543-2109",
    listName: "Staff & Produção",
    event: "Sunset Club Edition",
    status: "issued",
    checkedInAt: null,
    qrCode: "P8:G4:EVT2:5D6E7F",
  },
];

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  checked_in: { label: "Check-in Realizado", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  confirmed: { label: "Confirmado", class: "bg-blue-100 text-blue-700 border-blue-200" },
  issued: { label: "Emitido", class: "bg-amber-100 text-amber-700 border-amber-200" },
  blocked: { label: "Bloqueado", class: "bg-rose-100 text-rose-700 border-rose-200" },
};

export default function ConvidadosPage() {
  const [guests, setGuests] = useState(MOCK_GUESTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGuestQr, setSelectedGuestQr] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newGuest, setNewGuest] = useState({
    fullName: "",
    email: "",
    phone: "",
    listName: "Lista VIP Frontstage",
    notes: "",
  });

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.fullName) return;

    const guest = {
      id: `g-${Date.now()}`,
      fullName: newGuest.fullName,
      email: newGuest.email || "Sem e-mail",
      phone: newGuest.phone || "Sem telefone",
      listName: newGuest.listName,
      event: "Festival Pulsar 2026",
      status: "issued",
      checkedInAt: null,
      qrCode: `P8:G${Date.now()}:${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    };

    setGuests([guest, ...guests]);
    setIsAddModalOpen(false);
    setNewGuest({ fullName: "", email: "", phone: "", listName: "Lista VIP Frontstage", notes: "" });
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.fullName.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCheckedIn = guests.filter((g) => g.status === "checked_in").length;

  return (
    <AppShell title="Convidados & Listas VIP" subtitle="Gerenciamento de listas de acesso, emissão de QR Codes e controle de presença">
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone..."
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
                <option value="checked_in">Check-in Realizado</option>
                <option value="confirmed">Confirmados</option>
                <option value="issued">Emitidos</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary text-xs font-semibold py-2.5"
            >
              <Plus className="w-4 h-4" />
              Novo Convidado VIP
            </button>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card p-5 border border-surface-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-surface-500 font-medium">Total de Convidados</div>
              <div className="text-2xl font-bold font-display text-surface-900 mt-1">{guests.length} pessoas</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="card p-5 border border-surface-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-surface-500 font-medium">Check-ins Realizados</div>
              <div className="text-2xl font-bold font-display text-emerald-600 mt-1">
                {totalCheckedIn} ({Math.round((totalCheckedIn / guests.length) * 100)}%)
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="card p-5 border border-surface-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-surface-500 font-medium">Aguardando Entrada</div>
              <div className="text-2xl font-bold font-display text-amber-600 mt-1">
                {guests.length - totalCheckedIn} pessoas
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Guests Table */}
        <div className="card border border-surface-200/80 bg-white overflow-hidden shadow-sm">
          <div className="p-5 border-b border-surface-100 flex justify-between items-center">
            <h3 className="text-lg font-bold font-display text-surface-900">Lista Geral de Convidados</h3>
            <span className="text-xs text-surface-500 font-medium">{filteredGuests.length} convidados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 text-surface-500 font-medium border-b border-surface-100">
                <tr>
                  <th className="p-4">Convidado</th>
                  <th className="p-4">Lista de Acesso</th>
                  <th className="p-4">Evento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Horário Entrada</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="p-4 font-semibold text-surface-900">
                      <div>{guest.fullName}</div>
                      <div className="text-xs text-surface-400 font-normal">{guest.email} · {guest.phone}</div>
                    </td>
                    <td className="p-4 text-surface-700">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {guest.listName}
                      </span>
                    </td>
                    <td className="p-4 text-surface-600">{guest.event}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          STATUS_CONFIG[guest.status]?.class
                        }`}
                      >
                        {STATUS_CONFIG[guest.status]?.label}
                      </span>
                    </td>
                    <td className="p-4 text-surface-600">
                      {guest.checkedInAt
                        ? new Date(guest.checkedInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedGuestQr(guest)}
                        className="btn-secondary py-1.5 px-3 text-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-brand-600" />
                        Ver QR Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Novo Convidado */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-lg p-6 bg-white border border-surface-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 pb-3">
                <h3 className="text-lg font-bold font-display text-surface-900">Adicionar Convidado VIP</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddGuest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amanda Castro"
                    value={newGuest.fullName}
                    onChange={(e) => setNewGuest({ ...newGuest, fullName: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">E-mail</label>
                    <input
                      type="email"
                      placeholder="amanda@email.com"
                      value={newGuest.email}
                      onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Lista de Acesso</label>
                  <select
                    value={newGuest.listName}
                    onChange={(e) => setNewGuest({ ...newGuest, listName: e.target.value })}
                    className="input bg-white"
                  >
                    <option value="Lista VIP Frontstage">Lista VIP Frontstage</option>
                    <option value="Imprensa & Influencers">Imprensa & Influencers</option>
                    <option value="Artistas & DJ Backstage">Artistas & DJ Backstage</option>
                    <option value="Staff & Produção">Staff & Produção</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Salvar e Emitir QR Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Visualização de QR Code */}
        {selectedGuestQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-sm p-6 bg-white border border-surface-200 shadow-2xl text-center space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 pb-3 text-left">
                <div>
                  <h4 className="font-bold text-surface-900">{selectedGuestQr.fullName}</h4>
                  <span className="text-xs text-purple-600 font-semibold">{selectedGuestQr.listName}</span>
                </div>
                <button onClick={() => setSelectedGuestQr(null)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Code Canvas Mock */}
              <div className="p-6 bg-surface-900 text-white rounded-2xl space-y-3">
                <div className="w-48 h-48 bg-white p-3 rounded-xl mx-auto flex items-center justify-center border-4 border-brand-500 shadow-lg">
                  {/* SVG Mock QR Code */}
                  <svg className="w-full h-full text-surface-900" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="white" />
                    <path d="M0 0h30v30H0zM70 0h30v30H70zM0 70h30v30H0z" fill="#1e1b4b" />
                    <path d="M5 5h20v20H5zM75 5h20v20H75zM5 75h20v20H5z" fill="white" />
                    <path d="M10 10h10v10H10zM80 10h10v10H80zM10 80h10v10H10z" fill="#4c6ef5" />
                    <circle cx="50" cy="50" r="15" fill="#4c6ef5" />
                  </svg>
                </div>
                <div className="text-xs font-mono text-surface-400">{selectedGuestQr.qrCode}</div>
              </div>

              <p className="text-xs text-surface-500">
                Apresente este QR Code no leitor de portaria para validação do check-in.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
