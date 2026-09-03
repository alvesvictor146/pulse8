"use client";

import { useEffect } from "react";

export function PwaServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("PWA ServiceWorker registrado com sucesso:", reg.scope);
          })
          .catch((err) => {
            console.warn("Falha ao registrar ServiceWorker:", err);
          });
      });
    }
  }, []);

  return null;
}
