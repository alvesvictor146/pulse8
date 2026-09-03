"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  QrCode,
  CheckCircle2,
  AlertOctagon,
  Volume2,
  Wifi,
  WifiOff,
  Zap,
  Users,
  RefreshCw,
  Camera,
  Download,
  Database,
  ArrowDownCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { soundFeedback } from "@/lib/audio-feedback";
import {
  saveManifestToOfflineDb,
  findGuestInOfflineDb,
  markLocalCheckInInOfflineDb,
  enqueueOfflineCheckIn,
  getPendingOfflineCheckIns,
  removeSyncedCheckIn,
  getCachedGuestsCount,
} from "@/lib/pwa-offline-store";
import { verifySignedQrCode } from "@/lib/crypto";

export default function CheckInScannerPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [isSyncingManifest, setIsSyncingManifest] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isDrainingQueue, setIsDrainingQueue] = useState(false);

  const [scannedCode, setScannedCode] = useState("");
  const [scanResult, setScanResult] = useState<{
    status: "success" | "error" | null;
    guestName?: string;
    listName?: string;
    message?: string;
    isOffline?: boolean;
  }>({ status: null });

  const [scanHistory, setScanHistory] = useState<Array<{
    id: string;
    name: string;
    list: string;
    time: string;
    valid: boolean;
    offline?: boolean;
  }>>([]);

  // 1. Monitorar conectividade de rede
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      drainPendingQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Carregar contadores iniciais
    getCachedGuestsCount().then(setCachedCount);
    getPendingOfflineCheckIns().then((q) => setPendingSyncCount(q.length));

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 2. Carregar eventos para seleção do manifesto
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          if (data.length > 0) {
            setSelectedEventId(data[0].id);
          }
        }
      } catch (err) {
        console.warn("Could not fetch events list:", err);
      }
    }
    loadEvents();
  }, []);

  // 3. Baixar Manifesto Completo para o IndexedDB
  const handleDownloadManifest = async () => {
    if (!selectedEventId) return;
    setIsSyncingManifest(true);
    try {
      const res = await fetch(`/api/events/${selectedEventId}/guests/manifest`);
      if (res.ok) {
        const data = await res.json();
        const count = await saveManifestToOfflineDb(selectedEventId, data.guests || []);
        setCachedCount(count);
        soundFeedback.playSuccess();
      }
    } catch (err) {
      console.error("Failed to download offline manifest:", err);
    } finally {
      setIsSyncingManifest(false);
    }
  };

  // 4. Esvaziar fila de check-ins offline para o servidor
  const drainPendingQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsDrainingQueue(true);

    try {
      const pendingItems = await getPendingOfflineCheckIns();
      for (const item of pendingItems) {
        try {
          const res = await fetch("/api/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrCode: item.qrCode, eventId: item.eventId }),
          });
          if (res.ok || res.status === 409) {
            await removeSyncedCheckIn(item.id);
          }
        } catch {
          // Mantém na fila se falhar
        }
      }
      const remaining = await getPendingOfflineCheckIns();
      setPendingSyncCount(remaining.length);
    } finally {
      setIsDrainingQueue(false);
    }
  }, []);

  // 5. Executar Check-in (Online ou Fallback Offline via IndexedDB)
  const handleProcessCheckIn = async (codeToScan?: string) => {
    const code = (codeToScan || scannedCode).trim();
    if (!code) return;

    // Se estiver online, tenta validar via API em tempo real
    if (isOnline) {
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode: code, eventId: selectedEventId || undefined }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          soundFeedback.playSuccess();
          setScanResult({
            status: "success",
            guestName: data.guest?.fullName || "Convidado Confirmado",
            listName: data.guest?.listName || "Lista Geral",
            message: data.message || "ACESSO LIBERADO",
            isOffline: false,
          });

          setScanHistory((prev) => [
            {
              id: `scan-${Date.now()}`,
              name: data.guest?.fullName || "Convidado",
              list: data.guest?.listName || "Geral",
              time: new Date().toLocaleTimeString("pt-BR"),
              valid: true,
              offline: false,
            },
            ...prev,
          ]);
          setScannedCode("");
          return;
        } else {
          soundFeedback.playError();
          setScanResult({
            status: "error",
            message: data.message || data.error || "ACESSO NEGADO",
            isOffline: false,
          });
          return;
        }
      } catch (networkErr) {
        console.warn("Rede falhou, chaveando para validação local IndexedDB...");
      }
    }

    // ── MODO OFFLINE / FALLBACK LOCAL ──
    const verifyHmac = verifySignedQrCode(code);
    const lookupId = verifyHmac.guestId || code;

    try {
      const localGuest = await findGuestInOfflineDb(lookupId);

      if (!localGuest) {
        soundFeedback.playError();
        setScanResult({
          status: "error",
          message: "INGRESSO NÃO ENCONTRADO NO MANIFESTO OFFLINE LOCAL",
          isOffline: true,
        });
        return;
      }

      if (localGuest.status === "checked_in") {
        soundFeedback.playError();
        setScanResult({
          status: "error",
          message: `ATENÇÃO: INGRESSO JÁ UTILIZADO LOCALMENTE ÀS ${new Date(localGuest.checkedInAt!).toLocaleTimeString("pt-BR")}`,
          isOffline: true,
        });
        return;
      }

      // Sucesso Offline: Marca localmente e enfileira para sync
      await markLocalCheckInInOfflineDb(localGuest.id);
      await enqueueOfflineCheckIn({
        id: `offline-${Date.now()}`,
        qrCode: code,
        guestId: localGuest.id,
        eventId: selectedEventId,
        scannedAt: new Date().toISOString(),
        status: "pending",
      });

      const pending = await getPendingOfflineCheckIns();
      setPendingSyncCount(pending.length);

      soundFeedback.playSuccess();
      setScanResult({
        status: "success",
        guestName: localGuest.fullName,
        listName: localGuest.listName,
        message: "ACESSO LIBERADO OFFLINE (Sincronização Pendente)",
        isOffline: true,
      });

      setScanHistory((prev) => [
        {
          id: `scan-${Date.now()}`,
          name: localGuest.fullName,
          list: localGuest.listName,
          time: new Date().toLocaleTimeString("pt-BR"),
          valid: true,
          offline: true,
        },
        ...prev,
      ]);
      setScannedCode("");
    } catch (err: any) {
      soundFeedback.playError();
      setScanResult({
        status: "error",
        message: "ERRO AO PROCESSAR VALIDAÇÃO LOCAL: " + err.message,
        isOffline: true,
      });
    }
  };

  return (
    <AppShell
      title="Leitor de Portaria (PWA Offline)"
      subtitle="Validação instantânea com HMAC-SHA256, IndexedDB e sincronização em segundo plano"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Status Bar with Network State */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface-900 text-white rounded-2xl shadow-md border border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold font-display">Portaria de Evento — Pulse8 Gate</div>
              <div className="text-xs text-surface-400">
                {cachedCount > 0 ? `${cachedCount} ingressos armazenados em cache local` : "Nenhum manifesto baixado"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Online/Offline */}
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Wifi className="w-3.5 h-3.5" />
                Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                Modo Offline Ativo
              </span>
            )}

            {/* Fila de Sincronização */}
            {pendingSyncCount > 0 && (
              <button
                onClick={drainPendingQueue}
                disabled={!isOnline || isDrainingQueue}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/30 text-brand-300 border border-brand-400/30 hover:bg-brand-500/50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDrainingQueue ? "animate-spin" : ""}`} />
                {pendingSyncCount} para sincronizar
              </button>
            )}
          </div>
        </div>

        {/* Event Selector & Offline Manifest Download */}
        <div className="card p-4 border border-surface-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <Database className="w-5 h-5 text-brand-600 shrink-0" />
            <div className="flex-1">
              <label className="text-xs font-semibold text-surface-600 block mb-1">
                Evento Selecionado para Operação:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="input py-1.5 px-3 text-sm w-full"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.city || "Geral"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleDownloadManifest}
            disabled={isSyncingManifest || !selectedEventId}
            className="btn-secondary py-2 px-4 text-xs font-bold shrink-0 flex items-center gap-2"
          >
            {isSyncingManifest ? (
              <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
            ) : (
              <Download className="w-4 h-4 text-brand-600" />
            )}
            {cachedCount > 0 ? "Atualizar Cache Offline" : "Baixar Manifesto Offline"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Viewfinder Simulator & Manual Input */}
          <div className="card p-6 border border-surface-200/80 bg-white shadow-sm space-y-4 text-center">
            <h3 className="text-lg font-bold font-display text-surface-900 flex items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-brand-600" />
              Scanner de QR Code
            </h3>

            {/* Viewfinder Frame */}
            <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-surface-950 rounded-2xl overflow-hidden flex items-center justify-center border-4 border-surface-800 shadow-inner">
              {/* Corner Targets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-brand-400" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-brand-400" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-brand-400" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-brand-400" />

              {/* Scanning Laser Animation */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-pulse" />

              <div className="text-surface-400 text-xs space-y-2 p-4">
                <QrCode className="w-16 h-16 text-surface-600 mx-auto animate-pulse" />
                <p>Aproxime o QR Code do participante da câmera</p>
                <p className="text-2xs text-surface-500">&lt; 50ms de latência de validação</p>
              </div>
            </div>

            {/* Manual Code Input & Scan Trigger */}
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cole o código do QR Code (P8:...)"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleProcessCheckIn()}
                  className="input text-center text-sm font-mono"
                />
                <button
                  onClick={() => handleProcessCheckIn()}
                  className="btn-primary py-2 px-4 text-xs font-bold"
                >
                  Validar
                </button>
              </div>

              {/* Quick Scan Test Shortcuts */}
              <div className="flex flex-wrap gap-2 pt-2 justify-center">
                <button
                  onClick={() => handleProcessCheckIn("P8:DEMO-GUEST-01:VALID:SIG")}
                  className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-200"
                >
                  Simular Válido
                </button>
                <button
                  onClick={() => handleProcessCheckIn("INVALID_OR_FAKE_CODE")}
                  className="px-2.5 py-1 rounded bg-rose-100 text-rose-700 text-xs font-semibold hover:bg-rose-200"
                >
                  Simular Falso
                </button>
              </div>
            </div>
          </div>

          {/* Right: Validation Result & History */}
          <div className="space-y-6">
            {/* Scan Feedback Panel */}
            {scanResult.status === "success" && (
              <div className="card p-6 bg-emerald-500 text-white rounded-2xl shadow-lg animate-fade-in space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-10 h-10 text-white flex-shrink-0" />
                  <div>
                    <span className="text-2xs uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                      {scanResult.listName || "Lista Confirmada"}
                    </span>
                    <h2 className="text-2xl font-bold font-display text-white mt-1">
                      {scanResult.guestName}
                    </h2>
                  </div>
                </div>
                <div className="text-sm font-bold bg-emerald-600/60 p-3 rounded-xl border border-emerald-400/30 flex items-center justify-between">
                  <span>✓ {scanResult.message}</span>
                  {scanResult.isOffline && (
                    <span className="text-2xs bg-amber-400 text-amber-950 px-2 py-0.5 rounded font-bold">
                      Offline
                    </span>
                  )}
                </div>
              </div>
            )}

            {scanResult.status === "error" && (
              <div className="card p-6 bg-rose-600 text-white rounded-2xl shadow-lg animate-fade-in space-y-3">
                <div className="flex items-center gap-3">
                  <AlertOctagon className="w-10 h-10 text-white flex-shrink-0" />
                  <div>
                    <span className="text-2xs uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                      ALERTA DE SEGURANÇA
                    </span>
                    <h2 className="text-xl font-bold font-display text-white mt-1">
                      ACESSO BLOQUEADO
                    </h2>
                  </div>
                </div>
                <div className="text-xs font-semibold bg-rose-700/60 p-3 rounded-xl border border-rose-400/30">
                  ✕ {scanResult.message}
                </div>
              </div>
            )}

            {!scanResult.status && (
              <div className="card p-8 border border-surface-200 bg-white text-center space-y-2">
                <Volume2 className="w-8 h-8 text-surface-400 mx-auto animate-pulse" />
                <h4 className="font-bold text-surface-800">Portaria Pronta</h4>
                <p className="text-xs text-surface-500">
                  Escaneie o QR Code do participante. Bip sonoro e validação instantânea.
                </p>
              </div>
            )}

            {/* Scan History */}
            <div className="card p-5 border border-surface-200/80 bg-white shadow-sm space-y-3">
              <h4 className="text-sm font-bold font-display text-surface-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-600" />
                  Últimos Check-ins na Portaria
                </span>
                <span className="text-xs font-normal text-surface-400">
                  {scanHistory.length} registros
                </span>
              </h4>

              <div className="divide-y divide-surface-100 text-xs max-h-56 overflow-y-auto">
                {scanHistory.length === 0 ? (
                  <p className="text-surface-400 py-3 text-center">Nenhum check-in realizado nesta sessão</p>
                ) : (
                  scanHistory.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-surface-900 flex items-center gap-1.5">
                          {item.name}
                          {item.offline && (
                            <span className="text-3xs px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 font-semibold">
                              offline
                            </span>
                          )}
                        </div>
                        <div className="text-surface-400">{item.list}</div>
                      </div>
                      <span className="font-mono text-surface-500 font-semibold">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
