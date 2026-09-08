---
name: pulse8-checkin-pwa
description: PWA scanner, QR code HMAC security, and offline IndexedDB sync for gate check-in
---

# Gate Check-in & Offline PWA Architecture

This skill specifies offline-first check-in mechanics for gate operators at event venues.

## QR Code HMAC Signing Formula
QR payload string format:
`P8:<guest_id>:<event_id>:<timestamp>:<signature>`

Where signature is generated as:
$$\text{Signature} = \text{HMAC-SHA256}(\text{guest\_id} + ":" + \text{event\_id} + ":" + \text{timestamp}, \text{SECRET\_KEY})$$

## Offline Cache Engine
1. Before event start, PWA downloads complete guest manifest (`GET /api/events/:id/guests/manifest`).
2. Manifest stored in `IndexedDB` (`pulse8_checkin_store`).
3. Camera scans QR -> Validates HMAC -> Checks IndexedDB locally (< 50ms latency).
4. Emits audio feedback: Beep high (Valid) vs Beep low (Already Used / Invalid).
5. Background sync queue pushes check-in timestamps back to server via Service Worker once online.
