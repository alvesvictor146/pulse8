"use client";

import React, { useState } from "react";
import { Shield, Plus, DollarSign, Layers, Users, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const MOCK_ROLES = [
  { id: "r-1", name: "Coordenador de Portaria", department: "Operações", defaultPay: 450, accessLevel: "Staff Supervisor" },
  { id: "r-2", name: "Bartender Lead", department: "Bar & A&B", defaultPay: 350, accessLevel: "Staff Operacional" },
  { id: "r-3", name: "Engenheiro de Som Head", department: "Técnica", defaultPay: 800, accessLevel: "Técnico Especialista" },
  { id: "r-4", name: "Recepcionista VIP", department: "RP & Credenciamento", defaultPay: 280, accessLevel: "Staff Operacional" },
  { id: "r-5", name: "Líder de Segurança", department: "Segurança", defaultPay: 500, accessLevel: "Staff Supervisor" },
];

export default function FuncoesPage() {
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", department: "Operações", defaultPay: "350", accessLevel: "Staff Operacional" });

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) return;

    setRoles([...roles, {
      id: `r-${Date.now()}`,
      name: newRole.name,
      department: newRole.department,
      defaultPay: parseFloat(newRole.defaultPay) || 350,
      accessLevel: newRole.accessLevel,
    }]);

    setIsModalOpen(false);
    setNewRole({ name: "", department: "Operações", defaultPay: "350", accessLevel: "Staff Operacional" });
  };

  return (
    <AppShell title="Funções & Cargos" subtitle="Matriz de permissões, departamentos e valores de diária padrão por função">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-surface-900">Cargos da Produção</h2>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs font-semibold py-2.5">
            <Plus className="w-4 h-4" />
            Cadastrar Nova Função
          </button>
        </div>

        <div className="card border border-surface-200/80 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-surface-100">
              <thead className="bg-surface-50 text-surface-500 font-medium">
                <tr>
                  <th className="p-4">Cargo / Função</th>
                  <th className="p-4">Departamento</th>
                  <th className="p-4">Nível de Acesso</th>
                  <th className="p-4 text-right">Diária Padrão (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {roles.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="p-4 font-bold text-surface-900">{r.name}</td>
                    <td className="p-4 text-surface-700">{r.department}</td>
                    <td className="p-4 text-surface-600">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {r.accessLevel}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">
                      R$ {r.defaultPay.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Nova Função */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-md p-6 bg-white border border-surface-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 pb-3">
                <h3 className="text-lg font-bold font-display text-surface-900">Nova Função</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRole} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Nome da Função *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Coordenador de Palco"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Departamento</label>
                  <select
                    value={newRole.department}
                    onChange={(e) => setNewRole({ ...newRole, department: e.target.value })}
                    className="input bg-white"
                  >
                    <option value="Operações">Operações</option>
                    <option value="Bar & A&B">Bar & A&B</option>
                    <option value="Técnica">Técnica</option>
                    <option value="RP & Credenciamento">RP & Credenciamento</option>
                    <option value="Segurança">Segurança</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Diária Padrão (R$)</label>
                  <input
                    type="number"
                    value={newRole.defaultPay}
                    onChange={(e) => setNewRole({ ...newRole, defaultPay: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Salvar Cargo
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
