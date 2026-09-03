# EP-01: Autenticação, Multi-Tenancy & Segurança (RBAC)

**Módulo:** 01 (Autenticação) & 13 (Admin/Segurança)  
**Status Geral:** `[x]` 100% Concluído (Etapa 1)

---

## 📋 Histórias de Usuário & Checklist

- [x] **US-01: Login na Plataforma**
  - [x] Desenvolver tela de login responsiva com branding do Pulse8 (`src/app/page.tsx`).
  - [x] Adicionar suporte a alternância de exibição de senha (mostrar/ocultar).
  - [x] Implementar simulação/integração de autenticação e redirecionamento para `/dashboard`.

- [x] **US-02: Cadastro de Nova Organização (Produtora)**
  - [x] Desenvolver formulário de registro de produtora (`src/app/registro/page.tsx`).
  - [x] Coletar dados da produtora (Nome da Produtora, Nome do Responsável, E-mail, Telefone, Senha).
  - [x] Provisionar tenant isolado no modelo de dados (`organization_id`).

- [x] **US-03: Recuperação de Senha**
  - [x] Desenvolver tela de solicitação de redefinição de senha (`src/app/recuperar-senha/page.tsx`).
  - [x] Implementar feedback visual de confirmação de e-mail enviado.

- [x] **US-04: Estrutura de Multi-Tenancy & RBAC no Banco**
  - [x] Criar model `Organization` e `Membership` no Prisma Schema.
  - [x] Configurar niveis de acesso (`ADMIN`, `PRODUCER`, `FINANCE`, `STAFF`, `PROMOTER`).
