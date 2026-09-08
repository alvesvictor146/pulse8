# Pulse8 — Backlog do Produto (Épicos & Histórias de Usuário)

Este documento contém o **Backlog Completo de Desenvolvimento** do sistema Pulse8, organizado em **13 Épicos principais** e **Histórias de Usuário (User Stories)** detalhadas com critérios de aceitação.

---

## 🗺️ Visão Geral dos Épicos

```
EP-01: Autenticação, Multi-Tenancy & Segurança (RBAC)
EP-02: Dashboard Executivo & Visão Geral
EP-03: Módulo de Eventos, Setores & Lotes
EP-04: Gestão Financeira, Custos & DRE
EP-05: Convidados, Listas VIP & PWA de Check-in
EP-06: Equipe, RH & Gestão de Cargos
EP-07: Promoters, Links UTM & Comissionamento
EP-08: Fornecedores & Gestão de Contratos
EP-09: Cronogramas & Timelines Operacionais
EP-10: Marketing, Assets Digital & Post Queue
EP-11: Relatórios Executivos & BI Customizado
EP-12: Auditoria, Logs Imutáveis & Governança LGPD
EP-13: Integrações (Sympla, Gateways PIX & Webhooks)
```

---

## 📋 Detalhamento dos Épicos e Histórias

### 🔐 EP-01: Autenticação, Multi-Tenancy & Segurança (RBAC)

#### US-01: Login na Plataforma
* **Como** usuário cadastrado (produtor, staff ou financeiro),
* **Quero** realizar login seguro com meu e-mail e senha,
* **Para que** eu possa acessar o painel da minha produtora.
* **Critérios de Aceitação:**
  - Validar campos de e-mail e senha no cliente e servidor.
  - Exibir feedback de erro em caso de credenciais inválidas.
  - Redirecionar para `/dashboard` após sucesso.

#### US-02: Cadastro de Nova Organização (Produtora)
* **Como** novo cliente / produtor de eventos,
* **Quero** cadastrar minha produtora informando nome, e-mail corporativo, telefone e senha,
* **Para que** um tenant isolado (`organization_id`) seja provisionado automaticamente.
* **Critérios de Aceitação:**
  - Garantir unicidade de CNPJ/E-mail.
  - Criar registro no banco com tenant isolado e vincular usuário como `ADMIN`.

#### US-03: Recuperação de Senha
* **Como** usuário que esqueceu a senha,
* **Quero** solicitar um link de redefinição por e-mail,
* **Para que** eu possa cadastrar uma nova senha de forma segura.
* **Critérios de Aceitação:**
  - Enviar token temporário de redefinição com expiração de 1 hora.

---

### 🎪 EP-03: Módulo de Eventos, Setores & Lotes

#### US-04: Cadastro e Listagem Dinâmica de Eventos com Feedback Visual [CONCLUÍDO]
* **Como** gestor de produção,
* **Quero** cadastrar um evento informando nome, data, local, capacidade total, tema e banner, e ter retorno visual imediato se foi salvo com sucesso ou com erro,
* **Para que** eu possa gerenciar a operação do evento centralizadamente e acompanhar a listagem em tempo real.
* **Critérios de Aceitação & Entregas Concluídas:**
  - [x] Suportar status do evento: `Rascunho`, `Planejamento`, `Vendas Abertas`, `Finalizado`.
  - [x] Permitir input de URL de imagem de capa e metadados.
  - [x] **Card de Notificação Visual (Feedback UI):**
    - 🟢 Banner verde de sucesso com badge de confirmação e redirecionamento suave em 1.8s.
    - 🟡 Modo Demonstração com fallback local para testes sem sessão ativa.
    - 🔴 Banner vermelho com detalhamento amigável de erros de validação sem perda de dados.
  - [x] **Listagem Dinâmica:** Conexão com a API real `/api/events` e atualização instantânea da Grade e Lista.
  - [x] **Persistência PostgreSQL:** 22 tabelas criadas no Neon.tech e seed executado.

#### US-05: Gestão de Setores / Áreas e Lotes de Ingressos
* **Como** gestor de vendas,
* **Quero** definir as áreas do local (Ex: Pista, Camarote, Área VIP) e os lotes de ingressos com preço e quantidade,
* **Para que** o sistema controle a lotação e o faturamento previsto.
* **Critérios de Aceitação:**
  - Validar que a soma dos ingressos por área não ultrapasse a capacidade total do setor.

---

### 💰 EP-04: Gestão Financeira, Custos & DRE

#### US-06: Dashboard Financeiro (Previsto vs. Realizado)
* **Como** diretor financeiro,
* **Quero** visualizar gráficos comparativos entre orçamento previsto e despesas/receitas realizadas,
* **Para que** eu acompanhe a margem de lucro e DRE em tempo real.
* **Critérios de Aceitação:**
  - Calcular DRE automaticamente: $\text{Lucro} = \text{Receitas} - \text{Custos Fixos} - \text{Custos Variáveis} - \text{Comissões}$.
  - Exibir barra de progresso do orçamento consumido.

#### US-07: Importação de Vendas Sympla (CSV)
* **Como** operador financeiro,
* **Quero** importar o relatório de vendas do Sympla em arquivo CSV,
* **Para que** os valores de receita e lista de compradores sejam sincronizados sem digitação manual.
* **Critérios de Aceitação:**
  - Mapear automaticamente colunas: Pedido, Comprador, E-mail, Valor, Ingressos.
  - Ignorar registros duplicados com base no número do pedido.

#### US-08: Lançamento de Despesas com Anexo PIX
* **Como** produtor executivo,
* **Quero** cadastrar pagamentos de fornecedores informando plano de contas, vencimento, valor, chave PIX e comprovante,
* **Para que** o financeiro autorize a baixa do pagamento.
* **Critérios de Aceitação:**
  - Suportar status: `Planejado`, `Pendente`, `Aprovado`, `Pago`.

---

### 📱 EP-05: Convidados, Listas VIP & PWA de Check-in

#### US-09: Importação de Lista VIP em Lote
* **Como** RP / Relações Públicas do evento,
* **Quero** importar uma lista de convidados VIP em planilha CSV ou cadastro rápido,
* **Para que** QR Codes individuais sejam gerados para cada convidado.
* **Critérios de Aceitação:**
  - Gerar QR Code assinado via HMAC-SHA256 para evitar fraudes.

#### US-10: Operação de Portaria via PWA (Leitor QR Code Offline)
* **Como** operador de portaria,
* **Quero** escanear ingressos e QR Codes usando a câmera do smartphone mesmo sem sinal de internet,
* **Para que** o check-in seja realizado com tempo de resposta < 100ms.
* **Critérios de Aceitação:**
  - Armazenar o manifesto de convidados no IndexedDB do navegador.
  - Emitir bip sonoro tátil/visual para leitura válida (verde) ou duplicada/inválida (vermelho).
  - Sincronizar logs de entrada automaticamente assim que a conexão retornar.

---

### 👥 EP-07: Promoters, Links UTM & Comissionamento

#### US-11: Links de Venda Parametrizados (UTM)
* **Como** promoter de vendas,
* **Quero** gerar meus links personalizados com código de rastreio UTM,
* **Para que** as vendas realizadas através do meu link sejam atribuídas à minha conta.
* **Critérios de Aceitação:**
  - Gerar URL encurtada com parâmetros `utm_source=promoter&utm_medium=codigo`.

#### US-12: Extrato e Solicitacão de Saque de Comissão (PIX)
* **Como** promoter,
* **Quero** visualizar meu histórico de vendas, ranking na equipe e saldo de comissões acumuladas,
* **Para que** eu possa solicitar a baixa e pagamento via chave PIX.
* **Critérios de Aceitação:**
  - Exibir ranking / leaderboard em tempo real.
  - Permitir solicitação de saque ao atingir o valor mínimo configurado.

---

### 📊 EP-11 & EP-12: BI, Relatórios & Governança

#### US-13: Exportação de Relatórios Executivos em PDF
* **Como** gestor do evento,
* **Quero** exportar relatórios completos de DRE, entrada de convidados e vendas por promoter em PDF/CSV,
* **Para que** eu preste contas aos sócios e investidores.
* **Critérios de Aceitação:**
  - Gerar layout otimizado para impressão com logomarca da produtora.
