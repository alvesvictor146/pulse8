"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  CreditCard,
  QrCode,
  UserCheck,
  BarChart3,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourStep {
  targetId: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  description: string;
  producerTip: string;
  position: "right" | "bottom" | "left" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-nav-dashboard",
    title: "1. Painel de Controle Executivo",
    subtitle: "Visão 360º da Operação",
    badge: "Visão Geral",
    icon: Compass,
    description:
      "Bem-vindo ao Pulse8! Aqui no Dashboard você acompanha em tempo real a receita bruta, ingressos vendidos por lote, ocupação da arena e saúde financeira dos seus festivais.",
    producerTip:
      "💡 Dica do Produtor: Use os filtros de data no topo para comparar o desempenho de vendas semana a semana antes da virada de lote.",
    position: "right",
  },
  {
    targetId: "tour-nav-eventos",
    title: "2. Gestão de Eventos, Áreas & Lotes",
    subtitle: "Onde tudo começa na produção",
    badge: "Passo 1 Obrigatório",
    icon: CalendarDays,
    description:
      "É aqui que você cadastra seus novos eventos, divide o espaço em áreas (ex: Pista, Camarote VIP, Backstage) e define os preços e quantidades de cada lote de ingressos.",
    producerTip:
      "💡 Dica do Produtor: Cadastre o evento primeiro; ele liberará automaticamente o DRE financeiro, as listas de portaria e os links de promoters.",
    position: "right",
  },
  {
    targetId: "tour-nav-financeiro",
    title: "3. Orçamento & DRE Consolidado",
    subtitle: "Fórmula de Lucro Líquido sem planilhas soltas",
    badge: "Gestão Financeira",
    icon: CreditCard,
    description:
      "Chega de surpresas no pós-evento. O Pulse8 calcula automaticamente: Lucro Líquido = Receita de Ingressos e Bar - (Custos Fixos de Estrutura + Variáveis + Comissões de Promoters).",
    producerTip:
      "💡 Dica do Produtor: Vincule as despesas aos fornecedores cadastrados para controlar os comprovantes de pagamento e pagamentos via PIX.",
    position: "right",
  },
  {
    targetId: "tour-nav-checkin",
    title: "4. Portaria Inteligente PWA Offline",
    subtitle: "Validação ultra-rápida mesmo sem internet",
    badge: "Tecnologia de Ponta",
    icon: QrCode,
    description:
      "A internet caiu no portão da fazenda ou arena? Sem pânico! O nosso leitor PWA valida o ingresso em <50ms direto no celular via banco local (IndexedDB) com bips sonoros e criptografia anti-fraude.",
    producerTip:
      "💡 Dica do Produtor: Antes de abrir os portões, clique em 'Baixar Manifesto Offline'. Quando a internet voltar, todas as entradas sincronizam sozinhas.",
    position: "right",
  },
  {
    targetId: "tour-nav-promoters",
    title: "5. Rede de Promoters & Links UTM",
    subtitle: "Venda mais com afiliados e comissões automáticas",
    badge: "Vendas & Crescimento",
    icon: UserCheck,
    description:
      "Crie links exclusivos de divulgação com rastreamento UTM (ex: pulse8.app/r/LUCAS10). O sistema credita a comissão percentual ou fixa automaticamente a cada venda aprovada.",
    producerTip:
      "💡 Dica do Produtor: O ranking de promoters cria uma competição saudável entre a equipe de divulgadores e aumenta as vendas nos primeiros lotes.",
    position: "right",
  },
  {
    targetId: "tour-nav-relatorios",
    title: "6. Relatórios Oficiais & PDF para Sócios",
    subtitle: "Prestação de contas executiva com 1 clique",
    badge: "Exportação & Auditoria",
    icon: BarChart3,
    description:
      "Gere relatórios executivos prontos para impressão ou envio em PDF com o DRE completo, métricas de frequência, taxa de no-show e campos formais para assinatura da diretoria.",
    producerTip:
      "💡 Dica do Produtor: Apresente esse relatório em reuniões com sócios e patrocinadores para demonstrar transparência e governança profissional.",
    position: "right",
  },
];

interface ProductTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function ProductTour({ forceOpen = false, onClose }: ProductTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Abrir automaticamente na primeira visita
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStepIndex(0);
      return;
    }
    const tourCompleted = localStorage.getItem("pulse8_onboarding_completed");
    if (!tourCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Calcular posição do elemento alvo
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const el = document.getElementById(currentStep.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStepIndex, currentStep]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("pulse8_onboarding_completed", "true");
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen || !currentStep) return null;

  const Icon = currentStep.icon;

  // Posição do Card flutuante
  let cardStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
  };

  if (targetRect) {
    // Alinhar ao lado direito do elemento do menu lateral
    const topPos = Math.max(20, Math.min(window.innerHeight - 340, targetRect.top - 20));
    const leftPos = Math.min(window.innerWidth - 420, targetRect.right + 24);

    cardStyle = {
      ...cardStyle,
      top: `${topPos}px`,
      left: `${leftPos}px`,
    };
  } else {
    // Posição central como fallback
    cardStyle = {
      ...cardStyle,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  return (
    <>
      {/* ── Overlay Escurecido com Destaque ── */}
      <div
        onClick={handleComplete}
        className="fixed inset-0 bg-surface-950/70 backdrop-blur-xs z-9990 transition-opacity duration-300"
      />

      {/* ── Efeito Spotlight / Moldura Luminosa no Alvo ── */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            zIndex: 9995,
          }}
          className="rounded-xl border-2 border-brand-400 bg-brand-500/20 shadow-[0_0_24px_rgba(99,102,241,0.6)] animate-pulse pointer-events-none"
        />
      )}

      {/* ── Card Interativo do Tour com Seta ── */}
      <div
        style={cardStyle}
        className="w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-surface-200/90 p-6 z-9999 animate-fade-in relative text-surface-900"
      >
        {/* Seta indicativa apontando para o botão da barra lateral */}
        {targetRect && (
          <div
            style={{
              position: "absolute",
              left: "-10px",
              top: "32px",
              width: "0",
              height: "0",
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              borderRight: "10px solid #ffffff",
              filter: "drop-shadow(-2px 0 2px rgba(0,0,0,0.08))",
            }}
          />
        )}

        {/* Header do Card */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                <Sparkles className="w-3 h-3" />
                {currentStep.badge}
              </span>
              <p className="text-xs text-surface-500 font-medium mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={handleComplete}
            title="Pular tour"
            className="text-surface-400 hover:text-surface-700 p-1 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Título & Descrição */}
        <h3 className="text-base font-bold font-display text-surface-900 leading-snug mb-2">
          {currentStep.title}
        </h3>
        <p className="text-xs text-surface-600 leading-relaxed mb-4">
          {currentStep.description}
        </p>

        {/* Card da Dica do Produtor */}
        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-amber-900 text-xs leading-relaxed mb-5">
          {currentStep.producerTip}
        </div>

        {/* Footer com Controles de Navegação */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          {/* Indicador de passos */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentStepIndex
                    ? "w-6 bg-brand-600"
                    : "w-1.5 bg-surface-200"
                )}
              />
            ))}
            <span className="text-2xs font-bold text-surface-400 ml-1.5 font-mono">
              {currentStepIndex + 1}/{TOUR_STEPS.length}
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="btn-secondary py-1.5 px-2.5 text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5 shadow-sm"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Concluir Tour
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
