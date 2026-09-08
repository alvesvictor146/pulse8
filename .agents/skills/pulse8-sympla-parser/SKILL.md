---
name: pulse8-sympla-parser
description: Rules and CSV parsing logic for Sympla ticket sales exports in Pulse8
---

# Sympla CSV Import & Reconciliation Logic

This skill defines how ticket sales reports exported from Sympla (CSV) are parsed, sanitized, and reconciled into Pulse8.

## Sympla Standard CSV Columns
* `Número do Pedido` -> `orderNumber`
* `Nome Comprador` -> `buyerName`
* `Email Comprador` -> `buyerEmail`
* `Nome Participante` -> `guestName`
* `Email Participante` -> `guestEmail`
* `Ingresso` -> `ticketCategory`
* `Preço (R$)` -> `pricePaid`
* `Data do Pedido` -> `purchaseDate`
* `Status` -> `ticketStatus` (`Aprovado`, `Cancelado`)

## Deduplication & Reconciliation Rules
1. Orders with status `Cancelado` are marked inactive.
2. Unique identifier for guest check-in is `orderNumber` + `ticketCategory` + `guestEmail`.
3. Auto-assign guest type: If `ticketCategory` contains "VIP" or "Cortesia", set `type = VIP`.
