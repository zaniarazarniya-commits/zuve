"use client";

import { useState } from "react";
import { GrandLogo, GrandSwash, GrandMonogram } from "@/components/GrandLogo";

const VISIT_REASONS = ["Semester", "Jobb", "Konferens", "Övrigt"] as const;
type VisitReason = typeof VISIT_REASONS[number];

const inputCls = "w-full px-4 py-3 rounded-[4px] border border-sand bg-white text-[14px] text-foreground placeholder:text-granite-light focus:outline-none focus:border-primary transition-colors";
const labelCls = "text-[9px] tracking-[0.25em] uppercase text-granite font-medium";

export default function TavlingPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [reason, setReason] = useState<VisitReason | "">("");
  const [otherReason, setOtherReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allFilled =
    name.trim() !== "" &&
    phone.trim() !== "" &&
    email.trim() !== "" &&
    city.trim() !== "" &&
    reason !== "" &&
    (reason !== "Övrigt" || otherReason.trim() !== "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tavling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          city,
          visit_reason: reason === "Övrigt" ? otherReason.trim() : reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Något gick fel, försök igen.");
        return;
      }
      setDone(true);
    } catch {
      setError("Något gick fel, försök igen.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="w-full max-w-[340px] text-center reveal-in">
          <div className="mb-6 flex justify-center">
            <GrandLogo variant="compact" width={100} />
          </div>
          <GrandMonogram size={40} className="mx-auto mb-4 opacity-60" />
          <p className="font-baskerville text-[9px] tracking-[0.3em] uppercase text-muted font-medium mb-3">
            Anmälan mottagen
          </p>
          <h1 className="font-script text-[44px] text-primary leading-tight mb-4">
            Tack för ditt deltagande!
          </h1>
          <p className="text-[12.5px] text-granite leading-relaxed">
            Du är nu med i utlottningen av en gratis frukost på Grand Hotel Lysekil. Lycka till!
          </p>
          <div className="mt-8">
            <GrandSwash gold width={60} className="mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-[340px]">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <GrandLogo variant="compact" width={150} />
          </div>
          <GrandSwash gold width={60} className="mx-auto mb-4" />
          <p className="font-baskerville text-[9px] tracking-[0.32em] uppercase text-muted font-medium mb-3">
            Tävling · Grand Hotel Lysekil
          </p>
          <h1 className="font-script text-[52px] leading-tight text-primary">
            Vinn en Hotellfrukost
          </h1>
          <div className="mt-2 mb-4 flex justify-center">
            <div className="w-8 h-px bg-accent" />
          </div>
          <p className="text-[12.5px] text-granite leading-relaxed">
            Fyll i dina uppgifter och delta i utlottningen av en gratis frukost för en person på Grand Hotel Lysekil.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Namn */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className={labelCls}>Namn</label>
            <input id="name" type="text" autoComplete="name" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="För- och efternamn"
              required className={inputCls} />
          </div>

          {/* Telefon */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className={labelCls}>Telefonnummer</label>
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone}
              onChange={(e) => setPhone(e.target.value)} placeholder="070 000 00 00"
              required className={inputCls} />
          </div>

          {/* E-post */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelCls}>E-postadress</label>
            <input id="email" type="email" inputMode="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="din@epost.se"
              required className={inputCls} />
          </div>

          {/* Stad */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className={labelCls}>Stad</label>
            <input id="city" type="text" autoComplete="address-level2" value={city}
              onChange={(e) => setCity(e.target.value)} placeholder="Lysekil"
              required className={inputCls} />
          </div>

          {/* Anledning till besök */}
          <div className="flex flex-col gap-1.5">
            <span className={labelCls}>Anledning till besök</span>
            <div className="grid grid-cols-2 gap-2">
              {VISIT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`py-2.5 rounded-[4px] text-[11px] tracking-[0.15em] uppercase font-medium transition-colors border ${
                    reason === r
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-granite border-sand hover:border-primary/40"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {reason === "Övrigt" && (
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Berätta gärna..."
                required
                className={`${inputCls} mt-1`}
              />
            )}
          </div>

          {error && (
            <p role="alert" className="text-[11.5px] text-red-600 leading-snug">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !allFilled}
            className="mt-1 w-full py-3.5 rounded-[4px] bg-primary text-white text-[11px] tracking-[0.2em] uppercase font-medium disabled:opacity-50 transition-opacity"
          >
            {loading ? "Skickar…" : "Delta i tävlingen"}
          </button>

          <p className="mt-2 text-center text-[9.5px] text-granite-light leading-relaxed">
            Genom att delta i tävlingen godkänner du att Grand Hotel Lysekil
            skickar nyhetsbrev och erbjudanden till din e-postadress.
          </p>
        </form>

        <p className="mt-6 text-center font-baskerville text-[9.5px] tracking-[0.22em] uppercase text-muted">
          Grand Hotel Lysekil · Kungsgatan 36 · Lysekil
        </p>
      </div>
    </main>
  );
}
