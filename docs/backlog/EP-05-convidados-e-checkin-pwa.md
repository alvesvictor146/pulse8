# EP-05: Convidados, Listas VIP & PWA de Check-in

**Módulo:** 04 (Convidados & Check-in)  
**Status Geral:** `[x]` 100% Concluído (Etapa 3)

---

## 📋 Histórias de Usuário & Checklist

- [x] **US-13: Gestão de Listas VIP & Importação CSV**
  - [x] Cadastro manual e busca de listas de convidados (VIP, Imprensa, Staff, Artistas) em `src/app/convidados/page.tsx`.
  - [x] Geração e exibição de QR Code assinado via HMAC-SHA256 para participantes.

- [x] **US-14: Leitor PWA de Check-in Offline-First**
  - [x] PWA com leitor de QR Code integrado à câmera do celular em `src/app/checkin/page.tsx`.
  - [x] Simulação de leitura ultrarrápida com validação visual e feedback (Verde / Vermelho).
  - [x] Histórico de check-ins realizados em tempo real e contador de densidade.
