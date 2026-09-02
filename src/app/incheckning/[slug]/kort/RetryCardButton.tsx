"use client";

// ============================================================
// FIL: src/app/incheckning/[slug]/kort/RetryCardButton.tsx
//
// "Försök igen" på kvittosidan. Gästen som avbrutit hos Stripe har
// tappat sitt tillstånd i webbläsaren — incheckningen är sparad, men
// sidan som kunde starta kortregistreringen är borta. Den här knappen
// startar om samma anrop med gästens nyckel, som följt med i adressen.
// ============================================================

import { useState } from "react";

export function RetryCardButton({
  slug,
  guestKey,
  label = "Försök igen",
}: {
  slug: string;
  guestKey: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/incheckning/${slug}/kort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_key: guestKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Kunde inte öppna kortregistreringen.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Kunde inte öppna kortregistreringen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 text-[11.5px] text-red-600 leading-snug">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="w-full py-3.5 rounded-[4px] bg-primary text-white text-[11px] tracking-[0.2em] uppercase font-medium disabled:opacity-50 transition-opacity"
      >
        {loading ? "Öppnar…" : label}
      </button>
    </div>
  );
}
