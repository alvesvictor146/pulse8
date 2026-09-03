# EP-03: Módulo de Eventos, Setores & Lotes

**Módulo:** 03 (Eventos)  
**Status Geral:** `[x]` 100% Concluído (Etapa 2)

---

## 📋 Histórias de Usuário & Checklist

- [x] **US-07: Listagem de Eventos (Grid / Lista)**
  - [x] Implementar alternância de visualização entre Cards (Grid) e Tabela (Lista) em `src/app/eventos/page.tsx`.
  - [x] Adicionar filtros por status (`Rascunho`, `Planejamento`, `Em Vendas`, `Encerrado`) e busca por nome.

- [x] **US-08: Criar e Editar Evento**
  - [x] Desenvolver formulário com campos de nome, tema, local, cidade, estado, capacidade total, datas e upload de capa (`src/app/eventos/novo/page.tsx`).
  - [x] Conectar ao modelo `Event` do Prisma via API Handler (`src/app/api/events/route.ts`).

- [x] **US-09: Gestão de Setores / Áreas & Lotes de Ingressos**
  - [x] Criar interface para adicionar e visualizar áreas do evento (Pista, Camarote, VIP) com acessos e capacidade (`src/app/eventos/[id]/page.tsx`).
  - [x] Configurar lotes de ingressos com preço unitário, quantidade total, quantidade vendida e faturamento acumulado.
