# Pulse8 — Plano de Implementação Detalhado & Arquitetura Agêntica

 Este documento unifica o **Plano de Implementação de Engenharia** e a **Arquitetura Agêntica** configurada no Antigravity para o desenvolvimento do Pulse8.

---

## 💡 Visão Geral da Arquitetura Agêntica (`.agents/`)

A abordagem agêntica divide as responsabilidades em **Subagentes Especializados**, **Skills de Domínio** e **Regras de Código (Rules)** versionadas dentro de `pulse8/.agents/`.

```
pulse8/.agents/
├── rules/
│   ├── 01-design-system-ui.md       # Diretrizes visuais, Tailwind, HSL tokens
│   ├── 02-multi-tenant-security.md  # Isolamento por organization_id, LGPD, HMAC QR
│   └── 03-code-quality-nextjs.md    # Padrões Next.js 14 App Router, Zod e TypeScript
└── skills/
    ├── pulse8-design-system/        # Componentes atômicos (StatCard, Badges, Modais)
    ├── pulse8-domain-model/         # Fórmulas de DRE, schemas Prisma e RBAC
    ├── pulse8-sympla-parser/        # Sanitização e conciliação de CSV Sympla
    └── pulse8-checkin-pwa/          # QR Code HMAC e IndexedDB Sync offline
```

---

## 🗺️ Roteiro de Implementação das Etapas do MVP

```
[Etapa 1] ──► Setup, Design System, Auth & Dashboard Executivo [CONCLUÍDO]
     │
[Etapa 2] ──► Eventos, Áreas/Lotes & Gestão Financeira / DRE [CONCLUÍDO]
     │
[Etapa 3] ──► Convidados VIP, PWA Check-in & Cronogramas [CONCLUÍDO]
     │
[Etapa 4] ──► Equipe/RH, Funções & Promoters (Links UTM, Comissões, PIX) [PRÓXIMA]
     │
[Etapa 5] ──► Marketing (Assets Digital & Post Queue) + Fornecedores & Contratos
     │
[Etapa 6] ──► Relatórios Executivos/BI, Auditoria, Refinamento Visual DevTools & Deploy
```

---

## 🎯 Resumo dos Módulos Desenvolvidos

### Etapa 1: Base & Autenticação
- App Shell com Sidebar fixa e Header com busca global.
- Telas de Login (`/`), Cadastro de Organização (`/registro`) e Recuperação de Senha (`/recuperar-senha`).
- Dashboard Executivo Principal (`/dashboard`).

### Etapa 2: Eventos & Financeiro
- Módulo de Eventos (`/eventos`) com alternância Grid/Lista, criação de eventos (`/eventos/novo`) e painel de detalhes por tabs (`/eventos/[id]`).
- Módulo Financeiro (`/financeiro`) com DRE em tempo real, lançamento de despesas com chave PIX e modal de importação Sympla.

### Etapa 3: Convidados, Check-in & Cronogramas
- Módulo de Convidados (`/convidados`) com listas VIP, busca e QR Codes assinados (HMAC-SHA256).
- Leitor PWA de Portaria (`/checkin`) com scanner ultrarrápido (< 50ms) e feedback sonoro/visual verde/vermelho.
- Módulo de Cronogramas (`/cronogramas`) com linha do tempo dividida em Montagem, Show e Desmontagem.
