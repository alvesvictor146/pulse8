"use client";

import React, { useState } from "react";
import {
  Building,
  Search,
  Filter,
  Plus,
  Star,
  Phone,
  Mail,
  CreditCard,
  FileText,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const MOCK_SUPPLIERS = [
  {
    id: "s-1",
    name: "Luz & Som Brasil Ltda",
    cnpjCpf: "12.345.678/0001-90",
    contact: "Ricardo Alcantara",
    email: "contato@luzsombrasil.com.br",
    phone: "(11) 98765-4321",
    pix: "12.345.678/0001-90",
    category: "Som & Iluminação",
    rating: 5.0,
    contractStatus: "signed",
    eventsAttended: 12,
  },
  {
    id: "s-2",
    name: "Gardiã Segurança Privada",
    cnpjCpf: "98.765.432/0001-10",
    contact: "Capitão Mendes",
    email: "comercial@gardia.com.br",
    phone: "(11) 99887-1122",
    pix: "seguranca@gardia.com.br",
    category: "Segurança",
    rating: 4.8,
    contractStatus: "signed",
    eventsAttended: 8,
  },
  {
    id: "s-3",
    name: "MegaPower Geradores",
    cnpjCpf: "45.678.901/0001-33",
    contact: "Julio Cesar",
    email: "geradores@megapower.com",
    phone: "(11) 97654-9988",
    pix: "(11) 97654-9988",
    category: "Geradores & Estrutura",
    rating: 4.9,
    contractStatus: "review",
    eventsAttended: 5,
  },
  {
    id: "s-4",
    name: "Gourmet Eventos Buffet",
    cnpjCpf: "34.567.890/0001-22",
    contact: "Chef Helena Rios",
    email: "helena@gourmeteventos.com",
    phone: "(11) 96543-2211",
    pix: "helena@gourmeteventos.com",
    category: "Buffet & Catering",
    rating: 4.7,
    contractStatus: "signed",
    eventsAttended: 15,
  },
];

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    cnpjCpf: "",
    contact: "",
    email: "",
    phone: "",
    pix: "",
    category: "Som & Iluminação",
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;

    const item = {
      id: `s-${Date.now()}`,
      name: newSupplier.name,
      cnpjCpf: newSupplier.cnpjCpf || "N/A",
      contact: newSupplier.contact || "Contato Principal",
      email: newSupplier.email || "N/A",
      phone: newSupplier.phone || "N/A",
      pix: newSupplier.pix || "N/A",
      category: newSupplier.category,
      rating: 5.0,
      contractStatus: "signed",
      eventsAttended: 0,
    };

    setSuppliers([item, ...suppliers]);
    setIsModalOpen(false);
    setNewSupplier({ name: "", cnpjCpf: "", contact: "", email: "", phone: "", pix: "", category: "Som & Iluminação" });
  };

  const filteredSuppliers = suppliers.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.contact.toLowerCase().includes(search.toLowerCase()) ||
      item.cnpjCpf.includes(search);
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell title="Fornecedores & Contratos" subtitle="Catálogo de empresas parceiras, histórico de prestação de serviços e acertos PIX">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar fornecedor por nome, contato ou CNPJ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-surface-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input text-sm py-2 bg-white"
              >
                <option value="all">Todas as Categorias</option>
                <option value="Som & Iluminação">Som & Iluminação</option>
                <option value="Segurança">Segurança</option>
                <option value="Geradores & Estrutura">Geradores & Estrutura</option>
                <option value="Buffet & Catering">Buffet & Catering</option>
              </select>
            </div>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs font-semibold py-2.5">
            <Plus className="w-4 h-4" />
            Cadastrar Fornecedor
          </button>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="card p-6 border border-surface-200/80 bg-white hover:shadow-md transition-all space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {sup.category}
                  </span>
                  <h3 className="text-lg font-bold font-display text-surface-900 mt-1">{sup.name}</h3>
                  <p className="text-xs text-surface-400">CNPJ: {sup.cnpjCpf}</p>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{sup.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-surface-600 pt-2 border-t border-surface-100">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-surface-400" />
                  <span>Contato: <strong>{sup.contact}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-surface-400" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chave PIX: <strong className="font-mono text-surface-800">{sup.pix}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-100 flex justify-between items-center text-xs">
                <span className="text-surface-500 font-medium">{sup.eventsAttended} eventos atendidos</span>
                <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Contrato Ativo
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Novo Fornecedor */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-lg p-6 bg-white border border-surface-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 pb-3">
                <h3 className="text-lg font-bold font-display text-surface-900">Novo Fornecedor Parceiro</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Nome da Empresa / Fornecedor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Luz & Som Brasil Ltda"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">CNPJ / CPF</label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={newSupplier.cnpjCpf}
                      onChange={(e) => setNewSupplier({ ...newSupplier, cnpjCpf: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Categoria</label>
                    <select
                      value={newSupplier.category}
                      onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                      className="input bg-white"
                    >
                      <option value="Som & Iluminação">Som & Iluminação</option>
                      <option value="Segurança">Segurança</option>
                      <option value="Geradores & Estrutura">Geradores & Estrutura</option>
                      <option value="Buffet & Catering">Buffet & Catering</option>
                      <option value="Ambulância & Saúde">Ambulância & Saúde</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Nome do Contato</label>
                    <input
                      type="text"
                      placeholder="Nome da pessoa física"
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700">Chave PIX para Pagamentos</label>
                  <input
                    type="text"
                    placeholder="CNPJ, E-mail ou Telefone"
                    value={newSupplier.pix}
                    onChange={(e) => setNewSupplier({ ...newSupplier, pix: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Salvar Fornecedor
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
