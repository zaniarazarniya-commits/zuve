"use client";

// ============================================================
// FIL: src/app/admin/incheckning/[slug]/page.tsx
//
// Receptionens vy under gruppincheckningen. Visar vilka som
// checkat in, med rum och kontaktuppgifter, och vilka som saknas.
// Uppdateras automatiskt var 15:e sekund så att den kan stå
// framme på en skärm i receptionen.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Entry = {
  id: string;
  guest_key: string;
  guest_name: string;
  room_number: string;
  company_role: string | null;
  // Tomma för gäster receptionen checkat in i disken utan att fråga
  email: string | null;
  phone: string | null;
  allergies: string | null;
  second_night: boolean | null;
  staff_note: string | null;
  stripe_customer_id: string | null;
  card_brand: string | null;
  card_last4: string | null;
  created_at: string;
};

type Pending = {
  key: string;
  name: string;
  room: string;
  roomType: string;
  floor: number | null;
};

type GroupInfo = {
  slug: string;
  company: string;
  bookingId: string;
  checkIn: string;
  checkOut: string;
  total: number;
  asksSecondNight: boolean;
};

const REFRESH_MS = 15_000;

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminGroupCheckinPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Manuell incheckning: vem det gäller, plus det receptionen fyller i.
  const [manual, setManual] = useState<Pending | null>(null);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualSecondNight, setManualSecondNight] = useState<boolean | null>(null);
  const [manualInvoiced, setManualInvoiced] = useState(false);
  const [manualNote, setManualNote] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Bumpas när receptionen tagit bort en rad, för att ladda om direkt
  // istället för att vänta på nästa automatiska uppdatering.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/admin/incheckning/${slug}/entries`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Kunde inte hämta data.");
          return;
        }
        setGroup(data.group);
        setEntries(data.entries);
        setPending(data.pending);
        setError(null);
      } catch {
        if (!cancelled) setError("Kunde inte hämta data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [slug, reloadKey]);

  async function handleRelease(entry: Entry) {
    const ok = window.confirm(
      `Ta bort incheckningen för ${entry.guest_name} (rum ${entry.room_number})?\n\n` +
        "Namnet blir då valbart igen i listan."
    );
    if (!ok) return;

    const res = await fetch(`/api/admin/incheckning/${slug}/entries?id=${entry.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Kunde inte ta bort raden.");
      return;
    }
    setReloadKey((k) => k + 1);
  }

  function startManual(p: Pending) {
    setManual(p);
    setManualEmail("");
    setManualPhone("");
    setManualSecondNight(null);
    setManualInvoiced(false);
    setManualNote("");
    setManualError(null);
  }

  async function saveManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manual) return;
    setManualError(null);
    setManualSaving(true);
    try {
      // Kryssrutan är det receptionen använder i nio fall av tio; den
      // fria anteckningen läggs till efter, på egen rad.
      const note = [manualInvoiced ? "Minibar faktureras" : null, manualNote.trim() || null]
        .filter(Boolean)
        .join(" · ");

      const res = await fetch(`/api/admin/incheckning/${slug}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_key: manual.key,
          email: manualEmail,
          phone: manualPhone,
          second_night: manualSecondNight,
          staff_note: note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error ?? "Kunde inte spara incheckningen.");
        return;
      }
      setManual(null);
      setReloadKey((k) => k + 1);
    } catch {
      setManualError("Kunde inte spara incheckningen.");
    } finally {
      setManualSaving(false);
    }
  }

  const copyEmails = useCallback(() => {
    const emails = entries
      .map((e) => e.email)
      .filter((e): e is string => Boolean(e))
      .join(", ");
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [entries]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-12">
        <p className="text-[12.5px] text-granite">Laddar…</p>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="min-h-screen bg-background px-6 py-12">
        <p className="text-[12.5px] text-granite">{error ?? "Okänd grupp."}</p>
      </main>
    );
  }

  const done = entries.length;
  const pct = group.total > 0 ? Math.round((done / group.total) * 100) : 0;
  const withAllergies = entries.filter((e) => e.allergies);
  const staying = entries.filter((e) => e.second_night === true);
  const leaving = entries.filter((e) => e.second_night === false);
  const asksSecondNight = entries.some((e) => e.second_night !== null);

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[9.5px] tracking-[0.3em] uppercase text-accent font-medium mb-2">
            Gruppincheckning
          </p>
          <h1 className="font-serif text-[32px] text-primary leading-tight tracking-tight">
            {group.company}
          </h1>
          <div className="mt-3 w-8 h-px bg-accent" />
          <p className="mt-3 text-[12px] text-granite">
            {formatDate(group.checkIn)} · Bokning {group.bookingId}
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-6 text-[11.5px] text-red-600">
            {error}
          </p>
        )}

        {/* Status */}
        <div className="mb-8 rounded-[4px] border border-sand bg-white px-5 py-5">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[9px] tracking-[0.25em] uppercase text-granite font-medium">
              Incheckade
            </p>
            <p className="font-serif text-[26px] text-primary leading-none">
              {done} <span className="text-granite-light text-[18px]">/ {group.total}</span>
            </p>
          </div>
          <div className="h-1 w-full rounded-full bg-sand-light overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-[10.5px] text-granite-light">
            Uppdateras automatiskt var {REFRESH_MS / 1000}:e sekund.
          </p>
        </div>

        {/* Åtgärder */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <a
            href={`/api/admin/incheckning/${slug}/export`}
            className="px-4 py-2.5 rounded-[4px] bg-primary text-white text-[10px] tracking-[0.2em] uppercase font-medium transition-opacity hover:opacity-80"
          >
            Exportera Excel
          </a>
          <a
            href={`/incheckning/${slug}/flyer`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-[4px] border border-sand bg-white text-[10px] tracking-[0.2em] uppercase font-medium text-primary transition-colors hover:border-primary"
          >
            Skriv ut QR-skylt
          </a>
          <button
            onClick={copyEmails}
            disabled={entries.length === 0}
            className="px-4 py-2.5 rounded-[4px] border border-sand bg-white text-[10px] tracking-[0.2em] uppercase font-medium text-primary transition-colors hover:border-primary disabled:opacity-40"
          >
            {copied ? "Kopierat!" : "Kopiera e-poster"}
          </button>
        </div>

        {/* Natt 2 — vilka rum som ska vändas, och avstämning mot nästa dags lista */}
        {asksSecondNight && (
          <div className="mb-8 rounded-[4px] border border-sand bg-white px-5 py-4">
            <p className="text-[9px] tracking-[0.25em] uppercase text-granite font-medium mb-3">
              Natt 2
            </p>
            <div className="flex gap-8">
              <div>
                <p className="font-serif text-[26px] text-success leading-none">
                  {staying.length}
                </p>
                <p className="mt-1 text-[10.5px] text-granite">stannar</p>
              </div>
              <div>
                <p className="font-serif text-[26px] text-primary leading-none">
                  {leaving.length}
                </p>
                <p className="mt-1 text-[10.5px] text-granite">åker</p>
              </div>
            </div>
            {leaving.length > 0 && (
              <p className="mt-4 text-[11.5px] text-granite leading-relaxed">
                Rum som ska vändas:{" "}
                <strong>
                  {[...leaving]
                    .sort((a, b) =>
                      a.room_number.localeCompare(b.room_number, "sv", { numeric: true })
                    )
                    .map((e) => e.room_number)
                    .join(", ")}
                </strong>
              </p>
            )}
          </div>
        )}

        {/* Allergier samlat — det köket behöver, utan att läsa hela tabellen */}
        {withAllergies.length > 0 && (
          <div className="mb-10 rounded-[4px] border border-accent/40 bg-white px-5 py-4">
            <p className="text-[9px] tracking-[0.25em] uppercase text-granite font-medium mb-3">
              Allergier och specialkost ({withAllergies.length})
            </p>
            <ul className="flex flex-col gap-1.5">
              {withAllergies.map((e) => (
                <li key={e.id} className="text-[12.5px] text-foreground leading-relaxed">
                  <span className="text-granite">Rum {e.room_number} · {e.guest_name}</span>
                  {" — "}
                  <span className="text-accent font-medium">{e.allergies}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Incheckade */}
        <h2 className="text-[9px] tracking-[0.25em] uppercase text-granite font-medium mb-3">
          Incheckade
        </h2>
        {entries.length === 0 ? (
          <p className="text-[12.5px] text-granite mb-10">Ingen har checkat in ännu.</p>
        ) : (
          <div className="overflow-x-auto rounded-[4px] border border-sand mb-10">
            <table className="w-full text-[12px] text-foreground">
              <thead>
                <tr className="border-b border-sand bg-sand-light">
                  {["Rum", "Namn", "Företag / Position", "E-post", "Telefon", "Allergier", "Natt 2", "Kort", "Anteckning", "Tid", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[9px] tracking-[0.2em] uppercase font-medium text-granite whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr
                    key={e.id}
                    className={`border-b border-sand last:border-0 ${
                      i % 2 === 0 ? "bg-white" : "bg-background"
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{e.room_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{e.guest_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-granite">
                      {e.company_role ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sea">
                      {e.email || <span className="text-granite-light">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-granite">
                      {e.phone || <span className="text-granite-light">—</span>}
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      {e.allergies ? (
                        <span className="text-accent font-medium">{e.allergies}</span>
                      ) : (
                        <span className="text-granite-light">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {e.second_night === null ? (
                        <span className="text-granite-light">—</span>
                      ) : e.second_night ? (
                        <span className="text-success font-medium">Stannar</span>
                      ) : (
                        <span className="text-granite">Åker</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {e.card_last4 ? (
                        <span className="text-success font-medium">
                          {e.card_brand ?? "kort"} ••{e.card_last4}
                        </span>
                      ) : (
                        <span className="text-granite-light">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      {e.staff_note ? (
                        <span className="text-primary">{e.staff_note}</span>
                      ) : (
                        <span className="text-granite-light">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-granite-light">
                      {formatTime(e.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRelease(e)}
                        className="text-[9px] tracking-[0.15em] uppercase text-granite-light hover:text-red-600 transition-colors"
                      >
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Manuell incheckning — gästen står i disken */}
        {manual && (
          <form
            onSubmit={saveManual}
            className="mb-6 rounded-[4px] border border-accent/50 bg-white px-5 py-5"
          >
            <p className="text-[9px] tracking-[0.25em] uppercase text-granite font-medium mb-1">
              Checka in i receptionen
            </p>
            <p className="font-serif text-[20px] text-primary leading-tight">
              {manual.name}
            </p>
            <p className="mt-1 text-[11.5px] text-granite">
              Rum {manual.room} · {manual.roomType}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] tracking-[0.2em] uppercase text-granite font-medium">
                  E-post (valfritt)
                </span>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(ev) => setManualEmail(ev.target.value)}
                  placeholder="fornamn.efternamn@foretag.se"
                  className="px-3 py-2.5 rounded-[4px] border border-sand bg-white text-[13px] text-foreground placeholder:text-granite-light focus:outline-none focus:border-primary"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] tracking-[0.2em] uppercase text-granite font-medium">
                  Telefon (valfritt)
                </span>
                <input
                  type="tel"
                  value={manualPhone}
                  onChange={(ev) => setManualPhone(ev.target.value)}
                  placeholder="070-123 45 67"
                  className="px-3 py-2.5 rounded-[4px] border border-sand bg-white text-[13px] text-foreground placeholder:text-granite-light focus:outline-none focus:border-primary"
                />
              </label>
            </div>

            {group.asksSecondNight && (
              <div className="mt-4">
                <span className="text-[9px] tracking-[0.2em] uppercase text-granite font-medium">
                  Natt 2
                </span>
                <div className="mt-1.5 flex gap-2 flex-wrap">
                  {[
                    { value: true, label: "Stannar" },
                    { value: false, label: "Åker" },
                    { value: null, label: "Vet ej" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setManualSecondNight(opt.value)}
                      className={`py-2 px-3 rounded-[4px] text-[10px] tracking-[0.15em] uppercase font-medium border transition-colors ${
                        manualSecondNight === opt.value
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-granite border-sand hover:border-primary/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="mt-4 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={manualInvoiced}
                onChange={(ev) => setManualInvoiced(ev.target.checked)}
                className="mt-0.5"
              />
              <span className="text-[12.5px] text-foreground leading-snug">
                Minibar faktureras
                <span className="block text-[10.5px] text-granite-light">
                  Gästen har inte lämnat kort — notan går till företaget.
                </span>
              </span>
            </label>

            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-[9px] tracking-[0.2em] uppercase text-granite font-medium">
                Anteckning (valfritt)
              </span>
              <input
                type="text"
                value={manualNote}
                onChange={(ev) => setManualNote(ev.target.value)}
                placeholder="T.ex. sen ankomst, extra säng"
                className="px-3 py-2.5 rounded-[4px] border border-sand bg-white text-[13px] text-foreground placeholder:text-granite-light focus:outline-none focus:border-primary"
              />
            </label>

            {manualError && (
              <p role="alert" className="mt-4 text-[11.5px] text-red-600">
                {manualError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={manualSaving}
                className="px-4 py-2.5 rounded-[4px] bg-primary text-white text-[10px] tracking-[0.2em] uppercase font-medium disabled:opacity-50 transition-opacity"
              >
                {manualSaving ? "Sparar…" : "Checka in"}
              </button>
              <button
                type="button"
                onClick={() => setManual(null)}
                className="px-4 py-2.5 rounded-[4px] border border-sand bg-white text-[10px] tracking-[0.2em] uppercase font-medium text-granite transition-colors hover:border-primary"
              >
                Avbryt
              </button>
            </div>
          </form>
        )}

        {/* Kvar att checka in */}
        <h2 className="text-[9px] tracking-[0.25em] uppercase text-granite font-medium mb-3">
          Kvar att checka in ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-[12.5px] text-success">Alla i gruppen har checkat in.</p>
        ) : (
          <div className="overflow-x-auto rounded-[4px] border border-sand">
            <table className="w-full text-[12px] text-foreground">
              <thead>
                <tr className="border-b border-sand bg-sand-light">
                  {["Rum", "Namn", "Rumstyp", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[9px] tracking-[0.2em] uppercase font-medium text-granite whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((p, i) => (
                  <tr
                    key={p.key}
                    className={`border-b border-sand last:border-0 ${
                      i % 2 === 0 ? "bg-white" : "bg-background"
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{p.room}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-granite">{p.roomType}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => startManual(p)}
                        className="text-[9px] tracking-[0.15em] uppercase text-granite-light hover:text-primary transition-colors"
                      >
                        Checka in
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
