"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  X,
  UserCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const MOCK_TEAM = [
  {
    id: "p-1",
    fullName: "Carlos Eduardo Rossi",
    doc: "345.678.901-22",
    email: "carlos.rossi@email.com",
    phone: "(11) 98765-1122",
    pix: "carlos.rossi@email.com",
    role: "Coordenador de Portaria",
    department: "Operações",
    event: "Festival Pulsar 2026",
    payRate: 450,
    status: "in_shift",
  },
  {
    id: "p-2",
    fullName: "Mariana Ximenes Castro",
    doc: "234.567.890-11",
    email: "mariana.x@email.com",
    phone: "(11) 97654-3344",
    pix: "234.567.890-11",
    role: "Bartender Lead",
    department: "Bar & A&B",
    event: "Festival Pulsar 2026",
    payRate: 350,
    status: "active",
  },
  {
    id: "p-3",
    fullName: "Rodrigo Santoro Ramos",
    doc: "123.456.789-00",
    email: "rodrigo.s@email.com",
    phone: "(21) 99887-5566",
    pix: "(21) 99887-5566",
    role: "Engenheiro de Som Head",
    department: "Técnica",
    event: "Sunset Club Edition",
    payRate: 800,
    status: "active",
  },
  {
    id: "p-4",
    fullName: "Beatriz Mendes Ferreira",
    doc: "456.789.012-33",
    email: "beatriz.mendes@email.com",
    phone: "(11) 96543-7788",
    pix: "beatriz@pix.com",
    role: "Recepcionista VIP",
    department: "RP & Credenciamento",
    event: "Festival Pulsar 2026",
    payRate: 280,
    status: "in_shift",
  },
];

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  in_shift: { label: "Em Turno", class: "bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse" },
  active: { label: "Disponível", class: "bg-blue-100 text-blue-700 border-blue-200" },
  off: { label: "Folga", class: "bg-surface-100 text-surface-700 border-surface-200" },
};

export default function EquipePage() {
  const [team, setTeam] = useState(MOCK_TEAM);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newMember, setNewMember] = useState({
    fullName: "",
    doc: "",
    email: "",
    phone: "",
    pix: "",
    role: "Staff Geral",
    department: "Operações",
    payRate: "300",
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.fullName) return;

    const member = {
      id: `p-${Date.now()}`,
      fullName: newMember.fullName,
      doc: newMember.doc || "N/A",
      email: newMember.email || "Sem e-mail",
      phone: newMember.phone || "Sem telefone",
      pix: newMember.pix || "N/A",
      role: newMember.role,
      department: newMember.department,
      event: "Festival Pulsar 2026",
      payRate: parseFloat(newMember.payRate) || 300,
      status: "active",
    };

    setTeam([member, ...team]);
    setIsModalOpen(false);
    setNewMember({
      fullName: "",
      doc: "",
      email: "",
      phone: "",
      pix: "",
      role: "Staff Geral",
      department: "Operações",
      payRate: "300",
    });
  };

  const filteredTeam = team.filter((item) => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(search.toLowerCase()) ||
      item.role.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || item.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const totalPayroll = team.reduce((acc, item) => acc + item.payRate, 0);

  return (
    <AppShell title="Equipe & RH" subtitle="Gestão de colaboradores de produção, escalas de turno e folha de pagamento">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar por nome, cargo ou departamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-surface-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="input text-sm py-2 bg-white"
              >
                <option value="all">Todos os Departamentos</option>
                <option value="Operações">Operações</option>
                <option value="Bar & A&B">Bar & A&B</option>
                <option value="Técnica">Técnica</option>
                <option value="RP & Credenciamento">RP & Credenciamento</option>
              </select>
            </div>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs font-semibold py-2.5">
            <Plus className="w-4 h-4" />
            Cadastrar Colaborador
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card p-5 border border-surface-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-surface-500 font-medium">Equipe Total</div>
              <div className="text-2xl font-bold font-display text-surface-900 mt-1">{team.length} membros</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="card p-5 border border-surface-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-surface-500 font-medium">Em Turno Agora</div>
              <div className="text-2xl font-bold font-display text-emerald-600 mt-1">
                {team.filter((t) => t.status === "in_shift").length} pessoas
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="card p-5 border border-surface-200/80 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-surface-500 font-medium">Estimativa Folha Diária</div>
              <div className="text-2xl font-bold font-display text-brand-600 mt-1">
                R$ {totalPayroll.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Team Table */}
        <div className="card border border-surface-200/80 bg-white overflow-hidden shadow-sm">
          <div className="p-5 border-b border-surface-100 flex justify-between items-center">
            <h3 className="text-lg font-bold font-display text-surface-900">Quadro de Colaboradores</h3>
            <span className="text-xs text-surface-500 font-medium">{filteredTeam.length} registros</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 text-surface-500 font-medium border-b border-surface-100">
                <tr>
                  <th className="p-4">Colaborador</th>
                  <th className="p-4">Cargo / Depto</th>
                  <th className="p-4">Evento Alocado</th>
                  <th className="p-4">Diária (R$)</th>
                  <th className="p-4">Chave PIX</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredTeam.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-surface-900">{item.fullName}</div>
                      <div className="text-xs text-surface-400">CPF: {item.doc} · {item.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-surface-900">{item.role}</div>
                      <div className="text-xs text-surface-500">{item.department}</div>
                    </td>
                    <td className="p-4 text-surface-700 font-medium">{item.event}</td>
                    <td className="p-4 font-bold text-surface-900">
                      R$ {item.payRate.toFixed(2)}
                    </td>
                    <td className="p-4 text-surface-600 font-mono text-xs">{item.pix}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          STATUS_CONFIG[item.status]?.class
                        }`}
                      >
                        {STATUS_CONFIG[item.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Novo Colaborador */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-lg p-6 bg-white border border-surface-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 pb-3">
                <h3 className="text-lg font-bold font-display text-surface-900">Cadastrar Novo Colaborador</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Rossi"
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={newMember.doc}
                      onChange={(e) => setNewMember({ ...newMember, doc: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Cargo / Função</label>
                    <input
                      type="text"
                      placeholder="Ex: Coordenador de Portaria"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Departamento</label>
                    <select
                      value={newMember.department}
                      onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                      className="input bg-white"
                    >
                      <option value="Operações">Operações</option>
                      <option value="Bar & A&B">Bar & A&B</option>
                      <option value="Técnica">Técnica</option>
                      <option value="RP & Credenciamento">RP & Credenciamento</option>
                      <option value="Segurança">Segurança</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Valor Diária (R$)</label>
                    <input
                      type="number"
                      placeholder="350.00"
                      value={newMember.payRate}
                      onChange={(e) => setNewMember({ ...newMember, payRate: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Chave PIX</label>
                    <input
                      type="text"
                      placeholder="CPF, E-mail ou Tel"
                      value={newMember.pix}
                      onChange={(e) => setNewMember({ ...newMember, pix: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Cadastrar e Salvar
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
