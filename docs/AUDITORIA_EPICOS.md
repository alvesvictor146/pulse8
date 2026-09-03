# 📋 Auditoria Técnica — Pulse8 Épicos MVP
> **Data:** 2026-09-02 · **Versão:** 1.0 · **Auditor:** Antigravity AI
> **Stack:** Next.js 14 · TypeScript · Prisma 5 · PostgreSQL · TailwindCSS · Radix UI

---

## 🗺️ Índice

| Épico | Módulo | Status Declarado | Status Real | Criticidade |
|-------|--------|-----------------|-------------|-------------|
| EP-01 | Autenticação & Segurança | ✅ 100% | ⚠️ Parcial | 🔴 Alta |
| EP-02 | Dashboard Executivo | ✅ 100% | ✅ OK | 🟡 Média |
| EP-03 | Gestão de Eventos | ✅ 100% | ⚠️ Parcial | 🔴 Alta |
| EP-04 | Financeiro & DRE | ✅ 100% | ⚠️ Parcial | 🔴 Alta |
| EP-05 | Convidados & Check-in PWA | ✅ 100% | ⚠️ Parcial | 🔴 Alta |
| EP-06 | Equipe, RH & Cargos | ✅ 100% | ✅ OK | 🟡 Média |
| EP-07 | Promoters & Vendas | ✅ 100% | ⚠️ Parcial | 🔴 Alta |
| EP-08 | Fornecedores & Contratos | ✅ 100% | ✅ OK | 🟢 Baixa |
| EP-09 | Cronogramas & Timelines | ✅ 100% | ⚠️ Parcial | 🟡 Média |
| EP-10 | Marketing & Assets | ✅ 100% | ⚠️ Parcial | 🟡 Média |
| EP-11 | Relatórios & BI | ✅ 100% | ⚠️ Parcial | 🟡 Média |
| EP-12 | Auditoria & LGPD | ✅ 100% | ⚠️ Parcial | 🔴 Alta |
| EP-13 | Integrações Sympla/PIX | ✅ 100% | ⚠️ Parcial | 🔴 Alta |

---

## 🔴 Problemas Sistêmicos (Cross-Cutting)

Estes problemas afetam **toda** a aplicação e são bloqueantes para produção.

### 1. Ausência de Autenticação Real em Todas as APIs
**Criticidade: CRÍTICA**

Nenhuma rota de API implementa verificação de sessão/token. Qualquer requisição não autenticada consegue ler e gravar dados.

```typescript
// ❌ ATUAL — todos os routes (ex: /api/events/route.ts)
export async function GET(request: Request) {
  // Sem verificação de autenticação
  const events = await db.event.findMany({ where });
  return NextResponse.json(events);
}

// ✅ DEVE SER
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const orgId = session.user.organizationId;
  const events = await db.event.findMany({ where: { orgId, ...otherFilters } });
  return NextResponse.json(events);
}
```

### 2. Violação de Multi-Tenancy em Todas as APIs
**Criticidade: CRÍTICA**

O padrão `db.organization.findFirst()` retorna **qualquer** organização do banco, sem qualquer relação com o usuário logado.

```typescript
// ❌ PADRÃO INSEGURO em 7+ arquivos — exposição de dados entre produtoras
let org = await db.organization.findFirst(); // Retorna qualquer org!

// ✅ DEVE SER — extrair orgId da sessão autenticada
const orgId = session.user.organizationId;
```

Arquivos afetados: `api/events`, `api/guests`, `api/promoters`, `api/team`, `api/suppliers`, `api/finance/costs`, `api/audit`.

### 3. Uso de `any` no TypeScript
**Criticidade: ALTA**

O `where: any = {}` em múltiplas rotas anula a segurança de tipo do TypeScript/Prisma.

```typescript
// ❌ ATUAL
const where: any = {};

// ✅ DEVE SER
import { Prisma } from "@prisma/client";
const where: Prisma.EventWhereInput = {};
```

### 4. QR Code Gerado sem HMAC-SHA256
**Criticidade: ALTA**

A geração do QR Code em `api/guests/route.ts` usa `Math.random()` — ingressos são falsificáveis.

```typescript
// ❌ ATUAL — não seguro
const qrCode = `P8:${Date.now()}:${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// ✅ DEVE SER — HMAC-SHA256 assinado com chave secreta
import { createHmac } from "crypto";
const payload = `${guestId}:${Date.now()}`;
const sig = createHmac("sha256", process.env.QR_SECRET!).update(payload).digest("hex").slice(0, 16);
const qrCode = `P8:${payload}:${sig}`;
```

### 5. Ausência de Validação de Input (Zod)
**Criticidade: ALTA**

Nenhuma rota de API valida os dados recebidos. Campos obrigatórios como `fullName` ou `name` podem chegar `undefined`, causando erros 500.

### 6. Parser CSV Sympla — Frágil e Sem Persistência
**Criticidade: ALTA**

O parser usa `split(",")` simples que quebra em campos com vírgula e os dados **não são persistidos no banco**.

---

## EP-01: Autenticação, Multi-Tenancy & Segurança (RBAC)

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ UI Completa, Backend Ausente

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/page.tsx` | ✅ UI OK | Login é simulado via `setTimeout` + `window.location.href` |
| `src/app/registro/page.tsx` | ✅ UI OK | Formulário não conectado a API real |
| `src/app/recuperar-senha/page.tsx` | ✅ UI OK | Apenas visual, sem envio de e-mail |
| `prisma/schema.prisma` | ✅ Schema OK | Model `Membership` com RBAC definido |
| `src/app/api/*` | ❌ Ausente | Nenhuma rota usa sessão autenticada |

**Achados Críticos:**
1. `handleSubmit` faz `setTimeout(() => window.location.href = "/dashboard", 1200)` — qualquer pessoa acessa `/dashboard` sem credenciais.
2. Não há `middleware.ts` bloqueando rotas protegidas.
3. O campo `role` em `Membership` é `String` — deveria ser enum (`ADMIN | PRODUCER | FINANCE | STAFF | PROMOTER`).
4. Google OAuth presente na UI mas sem backend (sem `next-auth`).

### Critérios de Aceite (Definition of Done)

- [ ] **CA-01.1** — Integrar `next-auth` com Credentials Provider (email + bcrypt) e Google OAuth.
- [ ] **CA-01.2** — Criar `middleware.ts` que redireciona para `/` rotas protegidas sem sessão válida.
- [ ] **CA-01.3** — JWT/Session deve conter `{ userId, organizationId, role }` para uso em todas as APIs.
- [ ] **CA-01.4** — Recuperação de senha deve disparar e-mail via Resend com token JWT de 15 min.
- [ ] **CA-01.5** — Campo `role` em `Membership` deve ser refatorado para `enum MembershipRole` no Prisma.
- [ ] **CA-01.6** — 2FA implementado com TOTP (`otplib`) — não apenas flag boolean no schema.
- [ ] **CA-01.7** — Senha hasheada com `bcryptjs` (salt rounds ≥ 12) na rota de registro.
- [ ] **CA-01.8** — Todas as rotas `/api/*` devem retornar `401` se não houver sessão válida.

---

## EP-02: Dashboard Executivo & Visão Geral

**Status Declarado:** ✅ 100% · **Status Real:** ✅ Implementado (Dados Mock)

### Análise de Código

| Arquivo | Situação | Observação |
|---------|----------|------------|
| `src/app/dashboard/page.tsx` | ✅ OK | 4 StatCards, gráficos Recharts |
| `src/components/ui/stat-card.tsx` | ✅ OK | Componente bem estruturado |
| `src/components/layout/sidebar.tsx` | ✅ OK | 13 módulos mapeados |
| `src/components/layout/header.tsx` | ✅ OK | Busca, notificações e perfil |

**Achados:**
1. Todos os KPIs são hardcoded — sem `fetch()` para APIs reais.
2. Recharts client-side mas `"use client"` ausente em alguns componentes.

### Critérios de Aceite

- [ ] **CA-02.1** — StatCards devem buscar dados via `GET /api/dashboard/kpis` por `orgId`.
- [ ] **CA-02.2** — Gráfico de faturamento deve exibir dados dos últimos 12 meses reais.
- [ ] **CA-02.3** — "Eventos Recentes" paginada (máx 5) via `GET /api/events?limit=5`.
- [ ] **CA-02.4** — Skeleton loading states enquanto dados são buscados.
- [ ] **CA-02.5** — Dashboard responsivo em mobile (≤768px).

---

## EP-03: Módulo de Eventos, Setores & Lotes

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ API Existe mas Insegura e Incompleta

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/api/events/route.ts` | ⚠️ Funcional | Sem auth, retorna eventos de todas as orgs |
| `src/app/eventos/page.tsx` | ✅ UI OK | — |
| `src/app/eventos/novo/page.tsx` | ✅ UI OK | — |
| Schema `Event` | ✅ OK | Bom modelo com status, áreas, tickets |

**Achados Críticos:**
1. `GET /api/events` retorna **todos os eventos de todas as organizações** — violação de multi-tenancy.
2. Não existe rota `PUT /api/events/[id]` para edição.
3. Não existe rota `DELETE /api/events/[id]`.
4. Não há rotas para gestão de `Area` e `Ticket` (setores e lotes).
5. Upload de capa sem integração real com storage.

### Critérios de Aceite

- [ ] **CA-03.1** — `GET /api/events` deve filtrar por `orgId` da sessão.
- [ ] **CA-03.2** — Implementar `PUT /api/events/[id]` com validação Zod.
- [ ] **CA-03.3** — Implementar `DELETE /api/events/[id]` com soft-delete (status → `archived`).
- [ ] **CA-03.4** — Implementar `POST /api/events/[id]/areas` e `POST /api/events/[id]/tickets`.
- [ ] **CA-03.5** — Upload de capa via URL assinada Cloudflare R2.
- [ ] **CA-03.6** — Campo `status` validado contra enum definido.
- [ ] **CA-03.7** — Mudanças de status geram entrada automática no `AuditLog`.

---

## EP-04: Gestão Financeira, Custos & DRE

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ API Parcial, DRE com Dados Falsos

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/api/finance/costs/route.ts` | ⚠️ Parcial | Sem auth, ignora eventId da sessão |
| `src/app/financeiro/page.tsx` | ✅ UI OK | DRE calculado com dados hardcoded |
| Schema `CostItem` | ✅ Excelente | qty × unitCost = totalCost, status pipeline |
| Schema `Revenue` | ✅ OK | Fontes mapeadas (Sympla, Bar, Patrocínio) |

**Achados Críticos:**
1. A fórmula DRE é calculada no frontend com dados mock.
2. `POST /api/finance/costs` ignora `qty` e `unitCost` — aceita apenas `totalCost`.
3. Não existe `GET /api/finance/dre?eventId=xxx`.
4. Não existe rota para `Revenue` (receitas).
5. `CostAccount` existe no schema mas sem API ou UI.

### Critérios de Aceite

- [ ] **CA-04.1** — Implementar `GET /api/finance/dre?eventId={id}` com cálculo real:
  `Lucro = SUM(revenues) - SUM(costItems)`
- [ ] **CA-04.2** — `POST /api/finance/costs` deve aceitar `{ qty, unitCost }` e calcular `totalCost = qty × unitCost`.
- [ ] **CA-04.3** — Implementar `PUT /api/finance/costs/[id]` para atualizar status (`pending → paid`), registrando `paidAt`.
- [ ] **CA-04.4** — Implementar `GET /api/finance/revenues` e `POST /api/finance/revenues`.
- [ ] **CA-04.5** — O DRE da UI deve consumir dados reais do banco.
- [ ] **CA-04.6** — Alerta automático quando custo excede 80% do orçamento planejado.
- [ ] **CA-04.7** — Comissões de promoters integradas automaticamente no DRE.

---

## EP-05: Convidados, Listas VIP & PWA de Check-in

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ QR Code Inseguro, Check-in sem API

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/api/guests/route.ts` | ⚠️ Parcial | QR Code com Math.random(), sem auth |
| `src/app/convidados/page.tsx` | ✅ UI OK | — |
| `src/app/checkin/page.tsx` | ✅ UI OK | Simulação sem leitura real |
| Schema `Guest` | ✅ Excelente | Status pipeline completo, index em qrCode |

**Achados Críticos:**
1. QR Code gerado com `Math.random()` é **falsificável**.
2. Não existe rota `POST /api/checkin` para processar check-in via QR.
3. Não existe `PATCH /api/guests/[id]/checkin` para marcar como `checked_in`.
4. Histórico de check-in é simulado.

### Critérios de Aceite

- [ ] **CA-05.1** — QR Code gerado com HMAC-SHA256: `P8:{guestId}:{timestamp}:{sig}`.
- [ ] **CA-05.2** — Implementar `POST /api/checkin` que valida HMAC, verifica status e registra `checkedInAt`.
- [ ] **CA-05.3** — PWA de check-in deve chamar `POST /api/checkin` com o QR escaneado.
- [ ] **CA-05.4** — Service worker com cache offline — QR Codes validáveis localmente sem internet.
- [ ] **CA-05.5** — `GET /api/guests` com `orderBy: [{ checkedInAt: { nulls: "last" } }]`.
- [ ] **CA-05.6** — Importação CSV de convidados deve persistir no banco.
- [ ] **CA-05.7** — `GET /api/checkin/stats?eventId={id}` com contadores em tempo real.

---

## EP-06: Equipe, RH & Gestão de Cargos

**Status Declarado:** ✅ 100% · **Status Real:** ✅ Melhor estado do sistema

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/api/team/route.ts` | ⚠️ Parcial | Sem auth, sem filtro orgId |
| `src/app/equipe/page.tsx` | ✅ UI OK | — |
| Schema `People`, `Role`, `Assignment` | ✅ Excelente | Relação correta com turno e diária |

**Achados:**
1. Não existe rota `POST /api/team/assignments` para alocar pessoa a evento.
2. Não existe `GET /api/roles` para listar cargos.
3. Cálculo de custo de staff no DRE não integrado.

### Critérios de Aceite

- [ ] **CA-06.1** — `GET /api/team` deve filtrar por `orgId`.
- [ ] **CA-06.2** — Implementar `GET /api/roles` e `POST /api/roles`.
- [ ] **CA-06.3** — Implementar `POST /api/team/assignments` com turno e diária.
- [ ] **CA-06.4** — Custo de staff (`payRate × duração`) deve alimentar `CostItem` do evento.
- [ ] **CA-06.5** — Disponibilidade (`Ativo`, `Em Turno`, `Folga`) persistida no banco.

---

## EP-07: Promoters, Links UTM & Comissionamento

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ Links UTM não persistem vendas

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/api/promoters/route.ts` | ⚠️ Parcial | Sem auth, sem filtro orgId |
| `src/app/promoters/page.tsx` | ✅ UI OK | — |
| Schema `PromoLink`, `PromoSale`, `PromoCampaign` | ✅ Excelente | Modelo completo |

**Achados Críticos:**
1. Não existe rota para criar `PromoCampaign` — base para links e comissões.
2. Não existe rota para criar `PromoLink` (link UTM associado ao promoter).
3. Não existe `GET /api/promoters/[id]/sales` para extrato real.
4. Leaderboard é simulado com dados hardcoded.

### Critérios de Aceite

- [ ] **CA-07.1** — `POST /api/promoters/campaigns` para criar campanha com commission settings.
- [ ] **CA-07.2** — `POST /api/promoters/links` para gerar PromoLink com código único e URL UTM.
- [ ] **CA-07.3** — `GET /api/promoters/leaderboard?eventId={id}` com ranking real.
- [ ] **CA-07.4** — `GET /api/promoters/[id]/commissions` com cálculo: `percent → amount × rate / 100`.
- [ ] **CA-07.5** — Baixa de comissão via PIX registra `paidAt` com comprovante.
- [ ] **CA-07.6** — Leaderboard UI consome dados reais.

---

## EP-08: Fornecedores & Gestão de Contratos

**Status Declarado:** ✅ 100% · **Status Real:** ✅ Melhor implementado

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/api/suppliers/route.ts` | ⚠️ OK | Sem auth, sem filtro orgId |
| `src/app/fornecedores/page.tsx` | ✅ UI OK | — |
| Schema `Supplier` | ✅ OK | Campos corretos, rating decimal |

**Achados:**
1. Validação de CNPJ/CPF ausente.
2. Não há `PUT /api/suppliers/[id]` nem `DELETE`.
3. Histórico de eventos atendidos sem API.

### Critérios de Aceite

- [ ] **CA-08.1** — Validação de CNPJ/CPF no backend (algoritmo verificador).
- [ ] **CA-08.2** — Implementar `PUT /api/suppliers/[id]` e `DELETE /api/suppliers/[id]`.
- [ ] **CA-08.3** — `GET /api/suppliers` filtrado por `orgId`.
- [ ] **CA-08.4** — Model `SupplierContract` com `fileUrl`, `status`, `signedAt`.

---

## EP-09: Cronogramas & Timelines Operacionais

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ Sem API — Dados Estáticos

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/cronogramas/page.tsx` | ✅ UI OK | Gantt visual, dados hardcoded |
| Schema `Schedule` | ✅ OK | Tipos setup/run/teardown |

**Achados:**
1. Não existe nenhuma API Route para `Schedule`.
2. A visualização Gantt não tem persistência.

### Critérios de Aceite

- [ ] **CA-09.1** — `GET /api/schedules?eventId={id}` e `POST /api/schedules`.
- [ ] **CA-09.2** — `PUT /api/schedules/[id]` e `DELETE /api/schedules/[id]`.
- [ ] **CA-09.3** — UI busca dados reais de `GET /api/schedules`.
- [ ] **CA-09.4** — Status dos marcos atualizável inline (`pending | in_progress | done | delayed`).

---

## EP-10: Marketing, Assets Digital & Post Queue

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ Sem Storage Real

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/marketing/page.tsx` | ✅ UI OK | Assets hardcoded, sem upload real |
| Schema `PostQueue` | ✅ OK | Status pipeline completo |

**Achados:**
1. Não existe API Route para `PostQueue`.
2. Upload de assets sem integração com Cloudflare R2.
3. Agendamento de posts sem persistência.

### Critérios de Aceite

- [ ] **CA-10.1** — `GET /api/marketing/posts?eventId={id}` e `POST /api/marketing/posts`.
- [ ] **CA-10.2** — `POST /api/upload/asset` que salva em Cloudflare R2 e retorna URL pública.
- [ ] **CA-10.3** — `PUT /api/marketing/posts/[id]` para atualizar status.
- [ ] **CA-10.4** — Job de publicação agendada via Vercel Cron ou similar.

---

## EP-11: Relatórios Executivos & BI Customizado

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ Sem Dados Reais

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/relatorios/page.tsx` | ✅ UI OK | Dados hardcoded |
| — | ❌ Ausente | Nenhuma API de relatório |

**Achados:**
1. Relatório DRE com dados mock.
2. Exportação PDF usa `window.print()` sem template.
3. Exportação CSV não implementada.

### Critérios de Aceite

- [ ] **CA-11.1** — `GET /api/reports/dre?eventId={id}` com cálculo real.
- [ ] **CA-11.2** — `GET /api/reports/no-show?eventId={id}` com taxa de não comparecimento.
- [ ] **CA-11.3** — Exportação CSV com headers `Content-Type: text/csv` corretos.
- [ ] **CA-11.4** — Exportação PDF com template Pulse8 branded via `react-pdf`.
- [ ] **CA-11.5** — Ranking de promoters via `GET /api/promoters/leaderboard`.

---

## EP-12: Auditoria, Logs Imutáveis & Governança LGPD

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ Sem Automação e IP Hardcoded

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/api/audit/route.ts` | ⚠️ Parcial | ipAddress hardcoded "127.0.0.1", sem actorId |
| `src/app/seguranca/page.tsx` | ✅ UI OK | Lista logs |
| Schema `AuditLog` | ✅ Excelente | orgId, actorId, action, entity, entityId, payload, ip |

**Achados Críticos:**
1. `ipAddress: ipAddress || "127.0.0.1"` — ignora o IP real.
2. Nenhuma mutation em outras APIs grava `AuditLog` automaticamente.
3. Logs não são imutáveis — existe `POST` que qualquer um pode usar.
4. `actorId` nunca preenchido (sem sessão real).

### Critérios de Aceite

- [ ] **CA-12.1** — Criar `withAudit()` middleware que grava AuditLog automaticamente após mutações.
- [ ] **CA-12.2** — IP real extraído de `x-forwarded-for` ou `x-real-ip`.
- [ ] **CA-12.3** — `actorId` preenchido com ID do usuário autenticado.
- [ ] **CA-12.4** — Sem rota `DELETE` para AuditLog — política de retenção 2 anos via cron.
- [ ] **CA-12.5** — `GET /api/audit` exige role `ADMIN` ou `FINANCE`.
- [ ] **CA-12.6** — `GET /api/lgpd/export` para exportação dos dados pessoais do usuário.
- [ ] **CA-12.7** — `DELETE /api/lgpd/me` para anonimização de dados (LGPD Art. 18).

---

## EP-13: Integrações (Sympla, Gateways PIX & Webhooks)

**Status Declarado:** ✅ 100% · **Status Real:** ⚠️ Parser Frágil, Sem Persistência no Banco

### Análise de Código

| Arquivo | Situação | Problema |
|---------|----------|----------|
| `src/app/api/import/sympla/route.ts` | ⚠️ Parcial | Parser simples, dados não persistidos |
| `src/app/financeiro/page.tsx` | ✅ UI OK | Modal de importação presente |

**Achados Críticos:**
1. Parser CSV usa `split(",")` — quebra em campos com vírgulas (nomes, endereços).
2. Dados importados **não são salvos no banco** — retorna estatísticas mas não cria registros.
3. Sem integração com API REST da Sympla.
4. PIX apenas registro manual — sem gateway.
5. `eventId` enviado no FormData não é validado.

### Critérios de Aceite

- [ ] **CA-13.1** — Parser CSV RFC 4180 compliant (usar `papaparse`).
- [ ] **CA-13.2** — Importação persiste `Revenue` ou `PromoSale` para cada linha válida.
- [ ] **CA-13.3** — Validar que `eventId` pertence à `orgId` da sessão.
- [ ] **CA-13.4** — Importação usa transação atômica (`db.$transaction`) — falha = rollback total.
- [ ] **CA-13.5** — Baixa via PIX registra comprovante com `fileUrl` no `CostItem` ou `PromoSale`.
- [ ] **CA-13.6** — `POST /api/webhooks/sympla` para recebimento em tempo real de vendas.
- [ ] **CA-13.7** — Webhook valida assinatura `X-Sympla-Signature` via HMAC-SHA256.

---

## 📊 Resumo Executivo

### Contagem de Critérios de Aceite

| Prioridade | Quantidade | Descrição |
|-----------|-----------|-----------|
| 🔴 Crítico (Segurança) | 14 | Auth, Multi-tenancy, HMAC, LGPD |
| 🔴 Crítico (Funcional) | 18 | APIs ausentes que bloqueiam uso real |
| 🟡 Alta (Qualidade) | 16 | Validação Zod, persistência real |
| 🟢 Média (Melhoria) | 12 | UX, cache, exportações |
| **Total** | **60** | — |

### Mapa de Risco por Módulo

```
EP-01 Autenticação    ████████████████████ CRÍTICO — Bloqueia tudo
EP-03 Eventos         ████████████████░░░░ ALTO — CRUD incompleto
EP-04 Financeiro      ████████████████░░░░ ALTO — DRE com dados falsos
EP-05 Check-in        ████████████████░░░░ ALTO — QR Code falsificável
EP-07 Promoters       ████████████░░░░░░░░ ALTO — Sem comissões reais
EP-13 Integrações     ████████████░░░░░░░░ ALTO — Import sem persistência
EP-12 Auditoria       ████████░░░░░░░░░░░░ MÉDIO — Sem automação
EP-09 Cronogramas     ████░░░░░░░░░░░░░░░░ BAIXO — Sem API Backend
EP-02 Dashboard       ████░░░░░░░░░░░░░░░░ BAIXO — Dados mock
EP-06 Equipe          ████░░░░░░░░░░░░░░░░ BAIXO — Parcialmente funcional
EP-08 Fornecedores    ████░░░░░░░░░░░░░░░░ BAIXO — Funcional
EP-10 Marketing       ████░░░░░░░░░░░░░░░░ BAIXO — Sem storage
EP-11 Relatórios      ████░░░░░░░░░░░░░░░░ BAIXO — Dados mock
```

---

## 🛠️ Plano de Ação — 4 Sprints

### Sprint 1 — Fundação de Segurança (BLOQUEANTE)
1. Instalar `next-auth`, `bcryptjs`, `zod`
2. Criar rotas `/api/auth/[...nextauth]`
3. Implementar `middleware.ts` com proteção de rotas
4. Refatorar todas as APIs para `orgId` da sessão
5. Criar helper `withAudit()`

### Sprint 2 — APIs Core
1. CRUD completo de Eventos (PUT, DELETE, Areas, Tickets)
2. DRE real via `GET /api/finance/dre`
3. HMAC-SHA256 em QR Codes + `POST /api/checkin`
4. Zod em todas as rotas POST/PUT
5. Revenues API

### Sprint 3 — Integrações & Features
1. Parser CSV Sympla com `papaparse` + persistência em `db.$transaction`
2. PromoCampaigns, PromoLinks e Leaderboard real
3. Schedules API
4. Upload R2 para assets/capas
5. Export CSV com dados reais

### Sprint 4 — LGPD & Qualidade
1. Endpoints LGPD (export + anonimização)
2. Testes automatizados (Vitest)
3. Rate limiting nas APIs
4. Documentação OpenAPI
5. PDF branded via `react-pdf`

---

## 📦 Dependências a Adicionar

```json
{
  "next-auth": "^4.24.0",
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.6",
  "zod": "^3.23.0",
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.14",
  "resend": "^3.4.0",
  "otplib": "^12.0.1",
  "@aws-sdk/client-s3": "^3.600.0",
  "swr": "^2.2.5"
}
```

---

*Auditoria gerada em 2026-09-02 · Revisão recomendada a cada Sprint.*
