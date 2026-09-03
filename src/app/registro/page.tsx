"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Eye, EyeOff, ArrowRight, Mail, Lock, User, Building, Phone, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email,
          password,
          orgName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Erro ao registrar conta.");
        setIsLoading(false);
        return;
      }

      // Login automático após cadastro
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage("Erro de conexão ao servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-surface-900 via-surface-950 to-brand-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(76, 110, 245, 0.3) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(92, 124, 250, 0.2) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-white tracking-tight">
              Pulse<span className="text-brand-400">8</span>
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold font-display text-white leading-tight">
              Cadastre sua produtora e{" "}
              <span className="text-gradient">revolucione seus eventos.</span>
            </h1>
            <p className="text-lg text-surface-400 mt-4 leading-relaxed">
              Crie sua conta em 2 minutos. Teste grátis com suporte total a gestão de ingressos, financeiro e equipe.
            </p>
          </div>

          <p className="text-sm text-surface-600">
            © 2026 Pulse8 · Plataforma Completa de Gestão de Eventos
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-surface-900 tracking-tight">
              Pulse<span className="text-brand-600">8</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-display text-surface-900">
              Criar Conta de Organização
            </h2>
            <p className="text-sm text-surface-500 mt-1">
              Preencha os dados da sua produtora para iniciar
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome da Produtora */}
            <div className="space-y-1.5">
              <label htmlFor="orgName" className="text-sm font-medium text-surface-700">
                Nome da Produtora / Organização
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Ex: Prime Eventos Ltda"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Nome do Responsável */}
            <div className="space-y-1.5">
              <label htmlFor="userName" className="text-sm font-medium text-surface-700">
                Seu Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-surface-700">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@empresa.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-surface-700">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-surface-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input pl-10 pr-10"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Criar Conta Gratuitamente
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 pt-2">
            Já tem uma conta?{" "}
            <Link href="/" className="text-brand-600 hover:text-brand-700 font-semibold">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
