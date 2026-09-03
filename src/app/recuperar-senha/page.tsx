"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function PasswordRecoveryPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-display text-surface-900 tracking-tight">
            Pulse<span className="text-brand-600">8</span>
          </span>
        </div>

        <div className="card p-8 border border-surface-200/80 bg-white shadow-sm rounded-2xl">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-display text-surface-900">
                  Recuperar Senha
                </h2>
                <p className="text-sm text-surface-500 mt-2">
                  Informe o seu e-mail cadastrado e enviaremos o link para redefinição de senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-surface-700">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando instruções...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Enviar Link de Recuperação
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-surface-900">E-mail Enviado!</h3>
              <p className="text-sm text-surface-500">
                Se houver uma conta associada a <strong className="text-surface-800">{email}</strong>, você receberá o link de redefinição em instantes.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-surface-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-brand-600 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
