"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(res.error || "E-mail ou senha inválidos");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage("Ocorreu um erro ao tentar entrar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-surface-900 via-surface-950 to-brand-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(76, 110, 245, 0.3) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(92, 124, 250, 0.2) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-brand-400/8 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-white tracking-tight">
              Pulse<span className="text-brand-400">8</span>
            </span>
          </div>

          {/* Tagline */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold font-display text-white leading-tight">
              Gerencie seus eventos com{" "}
              <span className="text-gradient">precisão total.</span>
            </h1>
            <p className="text-lg text-surface-400 mt-4 leading-relaxed">
              Orçamentos, cronogramas, promoters, check-in e relatórios em uma
              única plataforma inteligente.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mt-8">
              {[
                "Orçamento & DRE",
                "Check-in QR Code",
                "Gestão de Promoters",
                "Importação Sympla",
                "Relatórios em PDF",
              ].map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-sm text-surface-300 font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-surface-600">
            © 2026 Pulse8 · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-surface-900 tracking-tight">
              Pulse<span className="text-brand-600">8</span>
            </span>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold font-display text-surface-900">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-surface-500 mt-2">
              Acesse sua conta para gerenciar seus eventos
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-surface-700"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-surface-700"
                >
                  Senha
                </label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <label
                htmlFor="remember"
                className="text-sm text-surface-600"
              >
                Manter conectado
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-50 px-3 text-surface-400">
                ou
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button className="btn-secondary w-full py-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-surface-500">
            Não tem uma conta?{" "}
            <Link
              href="/registro"
              className="text-brand-600 hover:text-brand-700 font-semibold"
            >
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
