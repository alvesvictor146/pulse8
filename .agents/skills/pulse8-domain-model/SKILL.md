---
name: pulse8-domain-model
description: Domain data structures, DRE formulas, and Prisma schema definitions for Pulse8
---

# Pulse8 Domain Model & DRE Calculation Rules

This skill documents the business domain rules for event production, financial DRE calculation, ticket categories, and roles.

## DRE (Demonstrativo do Resultado do Exercício) Structure

$$\text{Lucro Líquido} = \text{Receita Bruta Ingressos} + \text{Receita Bar/Patrocínio} - (\text{Custos Fixos} + \text{Custos Variáveis} + \text{Comissões Promoters})$$

### Categories
1. **Receitas**: Ingressos (Lotes 1, 2, VIP), Bar/Alimentação, Patrocínio, Estacionamento.
2. **Custos Fixos**: Locação de espaço, Som & Iluminação, Segurança, Geradores, Ambulância.
3. **Custos Variáveis**: ECAD, Impostos, Taxas de Plataforma (Sympla/Zig), Diárias de Staff.
4. **Comissões Promoters**: `(Vendas x Valor Unitário) * % Comissão` ou taxa fixa por ingresso.

## Multi-Tenant Organization Scope
Every database record MUST link to an `Organization`:
```prisma
model Event {
  id              String       @id @default(uuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  name            String
  date            DateTime
  budgetPlanned   Float
  budgetActual    Float
  status          EventStatus
}
```
