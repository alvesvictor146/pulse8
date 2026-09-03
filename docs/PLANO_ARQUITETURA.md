# Pulse8 — Especificação Técnica & Plano de Arquitetura e Implementação
**Sistema Completo de Gestão e Produção de Eventos**

---

## 1. Visão Geral do Produto

O **Pulse8** é uma plataforma SaaS *multi-tenant* desenvolvida para centralizar a operação 360° de produtoras de eventos de médio e grande porte. A plataforma unifica:
* **Gestão Financeira & DRE:** Controle de custos previstos x realizados, plano de contas e fluxo de caixa.
* **Planejamento Operacional:** Linhas do tempo (*timelines*), cronogramas de montagem/execução/desmontagem e escalas de staff.
* **Marketing & Divulgação:** Biblioteca de ativos digitais (*assets*), agendamento de posts com preview e campanhas com rastreio de UTM.
* **Força de Vendas & Promoters:** Links parametrizados, comissionamento automático, rankings e metas.
* **Acesso & Credenciamento:** Listas VIP, geração de QR Code seguro e motor de check-in ultrarrápido com suporte a operação offline.
* **Governança & Segurança:** RBAC granular, logs de auditoria imutáveis, 2FA e conformidade com a LGPD.

---

## 2. Processo de Engenharia: Das Necessidades ao Go-Live

```
1. Levantamento de Requisitos
       ↓
2. Análise de Negócio & Domínio
       ↓
3. Modelagem de Dados & Estados
       ↓
4. Arquitetura Técnica & Escalabilidade
       ↓
5. Plano de Implementação & Roadmap
```

---

## 3. Mapeamento de UI/UX (65 Telas / 13 Módulos)

Baseado no protótipo de alta fidelidade fornecido pelo cliente:

| # | Módulo | Telas Mapeadas | Componentes-Chave de Interface |
|---|---|---|---|
| **01** | **Autenticação** | Login, Cadastro de Organização, Recuperação de Senha | Card centralizado, validação de força de senha, feedback de erro em tempo real. |
| **02** | **Dashboard Geral** | Visão Executiva Principal | Grid com 4 KPIs superiores, resumo de eventos recentes, atalhos rápidos e gráficos. |
| **03** | **Eventos** | Listagem (Grid/Lista), Criar Evento, Detalhes, Editar Evento | Tabs de contexto, upload de mapa do local, gestão de áreas/setores e lotes de ingressos. |
| **04** | **Convidados & Check-in** | Lista de Convidados, Cadastro Individual/Lote, Leitor de Check-in, Detalhes e Edição | Barra de busca rápida por CPF/QR Code, contador de densidade por hora, tags de status (VIP, Confirmado, Check-in realizado). |
| **05** | **Financeiro & Custos** | Dashboard Financeiro, Orçamento Geral, Despesas, Receitas, Modais de Cadastro | Gráfico de evolução orçamentária (*Planned vs Actual*), tabela editável por plano de contas e conciliação bancária. |
| **06** | **Calendário & Cronogramas** | Calendário Mensal/Semanal, Cronograma por Tipo (Montagem/Show/Desmontagem), Timeline | Visão Gantt/Timeline com marcos horários, cards coloridos por tipo de atividade e filtros por evento. |
| **07** | **Marketing & Social** | Dashboard de Marketing, Biblioteca de Assets, Agendamentos de Posts, Campanhas | Grid de criativos (PSD/vídeo/imagem), visualizador com preview da rede social (Instagram/LinkedIn/Facebook) e cards de campanhas com ROI e CTR. |
| **08** | **Equipe & RH** | Lista de Colaboradores, Cadastro/Edição de Membro, Perfil de Desempenho | Badges de habilidades/competências, histórico de eventos trabalhados e controle de turnos/diárias. |
| **09** | **Funções & Cargos** | Lista de Cargos, Criar/Editar Função | Faixas salariais, departamento e matriz de permissões associadas à função. |
| **10** | **Promoters & Vendas** | Lista de Promoters, Criar/Editar Promoter, Campanhas de Venda e Metas | Tabela de ranking/leaderboard, extrato de comissões, gerador de links com UTM e solicitação de saque. |
| **11** | **Fornecedores** | Catálogo de Fornecedores, Cadastro, Detalhes com Histórico | Classificação por categoria (Som, Iluminação, Segurança, Buffet), histórico de contratos e avaliação de qualidade. |
| **12** | **Relatórios & BI** | Hub de Relatórios, Relatório de Eventos, Relatório Financeiro, Performance de Convidados, Custom Builder | Exportação em PDF/CSV, gráficos de rosca, barras empilhadas e construtor de consultas personalizadas. |
| **13** | **Admin, Config & Segurança** | Configurações Gerais, Segurança/2FA, Integrações (Stripe, Slack, Mailchimp, GA4), Backups, Controle de Acesso e Auditoria | Gestão de sessões ativas, logs detalhados de requisição/mutação e status de sincronização de backups. |

---

## 4. Arquitetura Técnica & Escalabilidade

```
                     ┌──────────────────────────────────────────────┐
                     │          Cloudflare Edge (WAF + CDN)         │
                     └──────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
         ┌──────────▼──────────┐                         ┌──────────▼──────────┐
         │   Web Dashboard     │                         │   Mobile Check-in   │
         │  Next.js 14+ (App)  │                         │ React Native / Expo │
         │  Tailwind + shadcn  │                         │  SQLite (Offline)   │
         └──────────┬──────────┘                         └──────────┬──────────┘
                                            │ HTTPS / WebSocket
                                  ┌─────────▼─────────┐
                                  │    NestJS Core    │
                                  │  (Fastify Engine) │
                                  └─────────┬─────────┘
                                            │
        ┌───────────────────────┬───────────┴───────────┬───────────────────────┐
        │                       │                       │                       │
┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
│  PostgreSQL   │       │  Redis Cache  │       │  BullMQ Queue │       │ Cloudflare R2 │
│ (Multi-tenant)│       │  & Pub/Sub    │       │ (Async Jobs)  │       │ (Zero Egress) │
│ Row-Level Sec │       │ Check-in Sync │       │ Imports / DRE │       │  Assets & PDFs│
└───────────────┘       └───────────────┘       └───────────────┘       └───────────────┘
```

### 4.1 Stack Tecnológica
* **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Lucide Icons, Recharts, TanStack Table v8.
* **Mobile (Check-in/Promoter):** React Native / Expo, Expo SQLite / WatermelonDB (para validação offline instantânea).
* **Backend:** Next.js Route Handlers ou NestJS estruturado com validação via Zod.
* **Banco de Dados:** PostgreSQL 16 com isolamento de tenant via `organization_id` e RLS (*Row Level Security*).
* **Filas & Processamento em Lote:** Redis + BullMQ (importação massiva de planilhas de convidados/vendas e cálculo de DRE).
* **Storage:** Cloudflare R2 (compatível com S3, sem taxas abusivas de transferência de arquivos pesados).
