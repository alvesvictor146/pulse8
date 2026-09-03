# 🚀 Guia de Deploy no Firebase App Hosting & Homologação — Pulse8

Este guia descreve o passo a passo para colocar o **Pulse8** no ar no **Firebase App Hosting**, conectado a um banco de dados **PostgreSQL (Neon / Supabase)** e apontado para o seu subdomínio na **HostGator** com **custo zero**.

---

## 📌 Visão Geral da Arquitetura de Homologação

```
[Cliente / Navegador]
        │
        ▼  (DNS CNAME: homolog.seudominio.com.br)
[HostGator (DNS / cPanel)]
        │
        ▼
[Firebase App Hosting (Google Cloud Run)]
   ├── Next.js 14 App Router (SSR + Client)
   └── Rotas de API (/api/events, /api/auth, etc.)
        │
        ▼  (DATABASE_URL com SSL)
[PostgreSQL Cloud (Neon.tech ou Supabase)]
   └── 22 Tabelas Relacionais do Pulse8
```

---

## 🛠️ Passo 1: Criar o Banco PostgreSQL Gratuito (Neon.tech)

1. Acesse **[neon.tech](https://neon.tech)** e crie uma conta gratuita (login direto com GitHub ou Google, sem pedir cartão).
2. Clique em **Create Project**:
   - **Nome:** `pulse8-staging`
   - **Região:** `US East (Ohio)` ou a mais próxima.
3. Copie a **Connection String** fornecida:
   ```text
   postgresql://usuario:senha@ep-exemplo.us-east-2.aws.neon.tech/pulse8-staging?sslmode=require
   ```
4. No terminal da sua máquina (na pasta `pulse8`), crie as tabelas e popule com dados de teste:
   ```bash
   # 1. Definir a variável temporariamente ou alterar no .env
   $env:DATABASE_URL="sua_string_do_neon_aqui"

   # 2. Criar as 22 tabelas
   npx prisma db push

   # 3. Criar os dados de demonstração (usuário admin, eventos, orçamentos)
   npm run prisma:seed
   ```
   > **Usuário criado no seed:** `admin@pulse8.com.br` | **Senha:** `Pulse8@2026!`

---

## 🛠️ Passo 2: Subir as Alterações para o GitHub

No terminal (na pasta do Pulse8):
```bash
git add .
git commit -m "feat: feedback visual, conexao dinamica de eventos e apphosting.yaml"
git push origin main
```

---

## 🛠️ Passo 3: Criar o App no Firebase Console

1. Acesse o **[Firebase Console](https://console.firebase.google.com/)**.
2. Clique em **Adicionar Projeto** (ou escolha um existente, ex: `pulse8-homolog`).
3. Mude para o plano **Blaze (Pay as you go)**:
   - *Nota:* O Firebase não cobrará nada pois o tráfego de homologação fica dentro da cota gratuita mensal (2 milhões de requisições).
4. No menu lateral esquerdo, vá em **App Hosting** (ou *Hospedagem de Apps*).
5. Clique em **Começar / Conectar com GitHub**.
6. Autorize e selecione o repositório do Pulse8 e a branch `main`.
7. O Firebase detectará automaticamente o arquivo `apphosting.yaml`.
8. Na seção de **Variáveis e Segredos (Secrets)**, configure:
   - `DATABASE_URL`: *(a string do Neon copiada no Passo 1)*
   - `NEXTAUTH_SECRET`: `pulse8_staging_jwt_secret_key_2026_super_secure`
   - `HMAC_SECRET`: `pulse8_qr_hmac_secret_key_production_2026`
   - `NEXTAUTH_URL`: *(a URL que o Firebase vai gerar ou seu subdomínio)*
9. Clique em **Finalizar e Fazer Deploy**.

O Firebase iniciará a compilação e, em cerca de 2 a 4 minutos, entregará o link ativo (ex: `https://pulse8-homolog.web.app`).

---

## 🛠️ Passo 4: Apontar o Subdomínio na HostGator (Opcional, mas Recomendado)

Para o cliente acessar algo como `homolog.seusite.com.br`:

1. Acesse o **cPanel** da sua conta HostGator.
2. Vá em **Editor de Zona DNS** (*Zone Editor*).
3. Localize o seu domínio e clique em **Gerenciar**.
4. Clique em **+ Adicionar Registro**:
   - **Nome:** `homolog.seudominio.com.br.`
   - **Tipo:** `CNAME`
   - **TTL:** `14400` (ou 3600)
   - **Registro:** O domínio fornecido pelo Firebase (ex: `pulse8-homolog.web.app.`)
5. No painel do Firebase App Hosting, clique em **Adicionar Domínio Personalizado** e digite `homolog.seudominio.com.br`. O certificado SSL será gerado automaticamente.

---

## 📋 Checklist de Validação com o Cliente

Envie a seguinte mensagem para o seu cliente:

```text
Olá! O ambiente de testes e homologação do Pulse8 está disponível:

🔗 Link de Acesso: https://pulse8-homolog.web.app
👤 Usuário de Teste: admin@pulse8.com.br
🔑 Senha: Pulse8@2026!

O que testar:
1. Cadastro de Eventos: Acesse "Criar Novo Evento", preencha os dados e veja a confirmação visual.
2. Gestão de Eventos: Veja o novo evento aparecendo no topo da lista e em grade.
3. Dashboard & Financeiro: Navegue pelos relatórios e gráficos executivos.
```
