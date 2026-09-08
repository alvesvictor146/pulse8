# Pulse8 — Plano de Execução do MVP & Checklist de Etapas

**Parâmetros de Negócio Confirmados:**
1. **Integração de Ingressos:** Foco inicial em importador de relatórios do **Sympla (CSV)** com estrutura pronta para API/Webhooks.
2. **Pagamentos de Comissões e Custos:** Baixa manual com comprovante e chave **PIX**, com camada de abstração para plug de Gateway (Asaas/Efí) na Fase 2.
3. **Check-in de Portaria:** **PWA (Progressive Web App)** de alta performance, leitura via câmera, responsivo e com cache offline local (IndexedDB / LocalStorage).
4. **Capacidade Inicial:** 10 produtoras simultâneas (*Multi-tenant* real com banco particionado por `organization_id`).

---

## 🗺️ Mapa de Etapas de Execução

```
[Etapa 1] ──► Setup do Projeto, Design System & Shell Base (Navbar/Sidebar/Auth) [CONCLUÍDO]
     │
[Etapa 2] ──► Módulo de Eventos & Gestão de Financeiro/Orçamento (Sympla CSV Prep) [EM ANDAMENTO]
     │
[Etapa 3] ──► Convidados, Listas VIP & PWA de Check-in (Leitor QR Code Offline-first)
     │
[Etapa 4] ──► Equipe/RH, Escalas & Módulo de Promoters (Links, Cupons, PIX)
     │
[Etapa 5] ──► Marketing (Assets & Agendador com Preview) + Fornecedores
     │
[Etapa 6] ──► Dashboards de BI/Relatórios, Auditoria, Refinamento Visual com DevTools & Deploy
```

---

## 📋 Detalhamento das Etapas

### 🚀 ETAPA 1: Setup do Projeto, Design System & Shell Base
* **Objetivo:** Estabelecer a fundação do monorepo / aplicação com o design visual exato do protótipo (65 telas).
* **Status:** **100% Concluído**
* **Tarefas:**
  - [x] Inicializar projeto Next.js 14+ (App Router) com TypeScript e Tailwind CSS.
  - [x] Configurar paleta de cores, tipografia (Inter/Plus Jakarta Sans), sombras e bordas do Pulse8.
  - [x] Instalar e configurar componentes base: Lucide React, Shadcn/UI (Dialog, Dropdown, Tabs, Button, Card, Badge).
  - [x] Desenvolver o **App Shell**:
    - Sidebar fixa com hierarquia visual dos 13 módulos e menu colapsável.
    - Header com barra de pesquisa global, notificações e perfil de usuário.
  - [x] Implementar fluxo de Autenticação com telas de **Login**, **Criar Conta de Organização** e **Recuperar Senha**.
  - [x] Implementar o **Dashboard Executivo Principal** (Métricas, Gráficos de barra/linha com Recharts, Eventos Recentes e Ações Rápidas).

---

### 🎟️ ETAPA 2: Gestão de Eventos & Orçamento Financeiro
* **Objetivo:** Permitir cadastro de eventos, feedback visual em tempo real e controle financeiro (Previsto x Realizado / DRE).
* **Status:** **80% Concluído (Eventos 100% / Financeiro e Sympla em andamento)**
* **Tarefas Concluídas:**
  - [x] **Módulo de Eventos & Feedback Visual:**
    - [x] Listagem de Eventos com alternância Grid / Lista conectada dinamicamente à API `/api/events` e cache local.
    - [x] Formulário estruturado de Criação de Eventos (`/eventos/novo`) com campos completos de tema, capacidade, local, datas e imagem de capa.
    - [x] **Card de Notificação Visual (Feedback UI):**
      - 🟢 Sucesso: Banner verde animado com badge "Salvo com Sucesso" e redirecionamento suave em 1.8s.
      - 🟡 Modo Demonstração: Armazena localmente e exibe aviso caso não haja sessão de login ativa.
      - 🔴 Erro: Card vermelho detalhando inconsistências ou erros de validação sem perder campos digitados.
  - [x] **Infraestrutura de Homologação & Nuvem (Custo R$ 0,00):**
    - [x] Migração do Prisma para **PostgreSQL** com suporte a conexões pooler (`DATABASE_URL`) e diretas (`directUrl`).
    - [x] Provisionamento do banco de dados na **Neon.tech** (Região: São Paulo AWS `sa-east-1`).
    - [x] Criação das 22 tabelas relacionais e execução do script de seed (`admin@pulse8.com.br` / `Pulse8@2026!`).
    - [x] Integração do **Firebase MCP**: Web App registrado, arquivos `.firebaserc`, `firebase.json` e `apphosting.yaml` configurados.
    - [x] Limpeza e saneamento do repositório GitHub (`alvesvictor146/pulse8`) com `.gitignore` adequado.
    - [x] Guia operacional completo de deploy documentado em `docs/GUIA_DEPLOY_FIREBASE.md`.

* **Próximas Tarefas da Etapa 2 (Em Andamento):**
  - [ ] Conclusão do deploy automático no Firebase App Hosting e apontamento CNAME no cPanel da HostGator.
  - [ ] Tela de Detalhes do Evento (`/eventos/[id]`) com tabs operacionais e lotes de ingressos.
  - [ ] **Módulo Financeiro & Orçamento:**
    - [ ] Dashboard Financeiro com comparativo de Orçamento vs. Despesas.
    - [ ] Gestão de Despesas com categorias, fornecedores, vencimento, comprovante e chave PIX.
    - [ ] Gestão de Receitas e conciliação.
    - [ ] Parser inicial para **importação de relatórios de vendas do Sympla (CSV)**.

---

### 📲 ETAPA 3: Convidados, Listas VIP & PWA de Check-in
* **Objetivo:** Gestão de convidados e operação de portaria instantânea sem necessidade de publicação nas lojas de app.
* **Tarefas:**
  - [ ] Gestão de Listas de Convidados (VIP, Imprensa, Artistas, Staff) com importação em lote.
  - [ ] Geração de QR Code assinado para convidados.
  - [ ] **PWA de Check-in:**
    - Modo de leitura de câmera ultrarrápido com feedback sonoro/tátil e visual.
    - Cache local de convidados para validação instantânea (< 100ms) sem depender da velocidade da rede.
    - Sincronização automática em background.
    - Painel em tempo real de fluxo de entrada e no-show.
  - [ ] Módulo de **Cronogramas & Linha do Tempo (Timeline)** de montagem, show e desmontagem.

---

### 👥 ETAPA 4: Equipe & RH, Funções e Promoters
* **Objetivo:** Gestão de equipe de produção e força de vendas de promoters com controle de comissão.
* **Tarefas:**
  - [ ] **Equipe & RH:**
    - Cadastro de membros da equipe com habilidades, dados de contato e chave PIX.
    - Tabela de Funções & Cargos com faixas salariais e permissões.
  - [ ] **Promoters & Vendas:**
    - Cadastro de Promoters com nível, equipe e taxa de comissão configurável.
    - Geração de links parametrizados (UTM) e cupons de promoter.
    - Painel de Extrato do Promoter com comissões calculadas, histórico de vendas e solicitação de baixa via PIX.
    - Leaderboard / Ranking de vendas de promoters.

---

### 📢 ETAPA 5: Marketing & Fornecedores
* **Objetivo:** Organização dos ativos de divulgação e controle de parceiros comerciais.
* **Tarefas:**
  - [ ] **Marketing & Social:**
    - Biblioteca de *Assets* (upload e organização de imagens, vídeos e PSDs).
    - Agendador de postagens com pré-visualização de rede social (Instagram, Facebook, LinkedIn).
    - Gestão de Campanhas de divulgação e metas de engajamento/conversão.
  - [ ] **Fornecedores:**
    - Catálogo de Fornecedores categorizado (Som/Luz, Segurança, Cenografia, Buffet).
    - Registro de contratos, contatos, dados bancários/PIX e avaliações.

---

### 📊 ETAPA 6: BI, Auditoria, DevTools Polish & Deploy
* **Objetivo:** Entrega dos relatórios executivos, auditoria de segurança e validação visual completa.
* **Tarefas:**
  - [ ] Dashboards de Relatórios Executivos (DRE do Evento, Performance de Promoters, Relatório de Convidados e Equipe).
  - [ ] Exportação de relatórios em PDF e planilhas XLSX/CSV.
  - [ ] Módulo de Configurações, Controle de Acesso (RBAC), 2FA e Logs de Auditoria.
  - [ ] **Auditoria Visual com DevTools:** Verificação pixel-perfect contra as 65 telas do PDF.
  - [ ] Deploy do MVP em ambiente de produção (Vercel + Supabase/PostgreSQL + Cloudflare R2).
