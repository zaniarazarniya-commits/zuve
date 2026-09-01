"use client";

// ============================================================
// FIL: src/app/incheckning/[slug]/page.tsx
//
// Gruppincheckning för gästen. Tre steg:
//   1. Hitta och välj sitt namn i listan
//   2. Fyll i e-post och telefon
//   3. Få sitt rumsnummer
//
// Rumsnumret kommer först i svaret på steg 2 — listan i steg 1
// innehåller aldrig rumsfördelningen.
// ============================================================

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { GrandLogo, GrandSwash, GrandMonogram } from "@/components/GrandLogo";

type Guest = { key: string; name: string; claimed: boolean };
type GroupMeta = { company: string; checkIn: string; checkOut: string };
type Confirmation = { name: string; room: string; roomType: string; floor: number | null };

const inputCls =
  "w-full px-4 py-3 rounded-[4px] border border-sand bg-white text-[15px] text-foreground placeholder:text-granite-light focus:outline-none focus:border-primary transition-colors";
const labelCls = "text-[9px] tracking-[0.25em] uppercase text-granite font-medium";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Gör namn jämförbara oavsett versaler och diakritiska tecken. */
function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default function GroupCheckinPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [group, setGroup] = useState<GroupMeta | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Guest | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  // --- Hämta namnlistan ---
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/incheckning/${slug}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(data.error ?? "Något gick fel.");
          return;
        }
        setGroup(data.group);
        setGuests(data.guests);
      } catch {
        if (!cancelled) setLoadError("Kunde inte hämta listan. Kontrollera din uppkoppling.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return guests;
    return guests.filter((g) => normalize(g.name).includes(q));
  }, [guests, query]);

  const remaining = guests.filter((g) => !g.claimed).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/incheckning/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_key: selected.key, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Något gick fel, försök igen.");
        return;
      }
      setConfirmation(data);
    } catch {
      setError("Något gick fel, försök igen.");
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================================
  // Laddar / trasig länk
  // ============================================================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-6">
        <p className="text-[12.5px] text-granite">Laddar…</p>
      </main>
    );
  }

  if (loadError || !group) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-[340px] text-center">
          <GrandMonogram size={40} className="mx-auto mb-5 opacity-60" />
          <h1 className="font-serif text-[24px] text-primary mb-3">Länken fungerar inte</h1>
          <p className="text-[12.5px] text-granite leading-relaxed">
            {loadError ?? "Okänd incheckningslänk."} Vänd dig till receptionen så hjälper vi dig.
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // STEG 3 — Rumsnumret
  // ============================================================
  if (confirmation) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[340px] text-center reveal-in">
          <div className="mb-6 flex justify-center">
            <GrandLogo variant="light" width={150} />
          </div>

          <p className="font-baskerville text-[9px] tracking-[0.3em] uppercase text-muted font-medium mb-3">
            Incheckad
          </p>
          <h1 className="font-script text-[40px] text-primary leading-tight mb-6">
            Välkommen, {confirmation.name.split(" ")[0]}!
          </h1>

          {/* Rumskortet */}
          <div className="rounded-[4px] border border-sand bg-white px-6 py-8 shadow-sm">
            <p className={labelCls}>Ditt rum</p>
            <p className="font-serif text-[64px] leading-none text-primary my-3">
              {confirmation.room}
            </p>
            <div className="mx-auto w-8 h-px bg-accent my-4" />
            <p className="text-[13px] text-granite">
              {confirmation.roomType}
              {confirmation.floor !== null && ` · Våning ${confirmation.floor}`}
            </p>
          </div>

          <p className="mt-6 text-[12.5px] text-granite leading-relaxed">
            Gå till receptionen och säg att du bor i rum <strong>{confirmation.room}</strong> så
            får du dina nycklar. Du behöver inte fylla i någon blankett.
          </p>

          <p className="mt-4 text-[11px] text-granite-light leading-relaxed">
            Ta gärna en skärmbild — den här sidan går inte att öppna igen.
          </p>

          <div className="mt-8">
            <GrandSwash gold width={60} className="mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // STEG 2 — Kontaktuppgifter
  // ============================================================
  if (selected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[340px]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <GrandLogo variant="light" width={170} />
            </div>
            <p className="font-baskerville text-[9px] tracking-[0.3em] uppercase text-muted font-medium mb-3">
              Steg 2 av 2
            </p>
            <h1 className="font-script text-[40px] leading-tight text-primary">
              Hej {selected.name.split(" ")[0]}!
            </h1>
            <div className="mt-2 mb-4 flex justify-center">
              <div className="w-8 h-px bg-accent" />
            </div>
            <p className="text-[12.5px] text-granite leading-relaxed">
              Fyll i dina uppgifter så visar vi vilket rum du bor i.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={labelCls}>
                E-postadress
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.se"
                required
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className={labelCls}>
                Telefonnummer
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="070 000 00 00"
                required
                className={inputCls}
              />
            </div>

            {error && (
              <p role="alert" className="text-[11.5px] text-red-600 leading-snug">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || email.trim() === "" || phone.trim() === ""}
              className="mt-1 w-full py-3.5 rounded-[4px] bg-primary text-white text-[11px] tracking-[0.2em] uppercase font-medium disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Checkar in…" : "Visa mitt rum"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setError(null);
              }}
              className="mt-1 w-full py-2 text-[11px] tracking-[0.15em] uppercase text-granite hover:text-primary transition-colors"
            >
              ← Det är inte jag
            </button>

            <p className="mt-2 text-center text-[9.5px] text-granite-light leading-relaxed">
              Uppgifterna används för din incheckning på Grand Hotel Lysekil.
            </p>
          </form>
        </div>
      </main>
    );
  }

  // ============================================================
  // STEG 1 — Hitta ditt namn
  // ============================================================
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12 bg-background">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <GrandLogo variant="light" width={190} />
          </div>
          <p className="font-baskerville text-[9px] tracking-[0.3em] uppercase text-muted font-medium mb-3">
            {group.company} · {formatDate(group.checkIn)}
          </p>
          <h1 className="font-script text-[46px] leading-tight text-primary">Hitta ditt namn</h1>
          <div className="mt-2 mb-4 flex justify-center">
            <div className="w-8 h-px bg-accent" />
          </div>
          <p className="text-[12.5px] text-granite leading-relaxed">
            Välj ditt namn i listan så visar vi vilket rum du bor i.
          </p>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök på ditt namn…"
          aria-label="Sök på ditt namn"
          className={`${inputCls} mb-4`}
        />

        <ul className="flex flex-col gap-2">
          {filtered.map((g) => (
            <li key={g.key}>
              <button
                type="button"
                disabled={g.claimed}
                onClick={() => setSelected(g)}
                className={`w-full text-left px-4 py-3.5 rounded-[4px] border transition-colors ${
                  g.claimed
                    ? "border-sand bg-sand-light text-granite-light cursor-not-allowed"
                    : "border-sand bg-white text-foreground hover:border-primary"
                }`}
              >
                <span className="text-[15px]">{g.name}</span>
                {g.claimed && (
                  <span className="float-right text-[9.5px] tracking-[0.2em] uppercase text-success">
                    Incheckad
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="text-center text-[12.5px] text-granite py-6 leading-relaxed">
            Hittar inget namn som matchar. Prova att söka på förnamnet, eller fråga i receptionen.
          </p>
        )}

        <p className="mt-6 text-center text-[11px] text-granite-light">
          {remaining} av {guests.length} kvar att checka in
        </p>

        <p className="mt-6 text-center font-baskerville text-[9.5px] tracking-[0.22em] uppercase text-muted">
          Grand Hotel Lysekil · Kungsgatan 36 · Lysekil
        </p>
      </div>
    </main>
  );
}
