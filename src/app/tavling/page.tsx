"use client";

import { useState } from "react";

type Field = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
};

const FIELDS: Field[] = [
  { id: "name", label: "Namn", type: "text", placeholder: "För- och efternamn", autoComplete: "name" },
  { id: "phone", label: "Telefonnummer", type: "tel", placeholder: "070 000 00 00", inputMode: "tel", autoComplete: "tel" },
  { id: "email", label: "E-postadress", type: "email", placeholder: "din@epost.se", inputMode: "email", autoComplete: "email" },
  { id: "address", label: "Gatuadress", type: "text", placeholder: "Storgatan 1", autoComplete: "street-address" },
  { id: "city", label: "Stad", type: "text", placeholder: "Lysekil", autoComplete: "address-level2" },
  { id: "postal_code", label: "Postnummer", type: "text", placeholder: "45000", inputMode: "numeric", autoComplete: "postal-code" },
];

export default function TavlingPage() {
  const [values, setValues] = useState<Record<string, string>>({
    name: "", phone: "", email: "", address: "", city: "", postal_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((v) => ({ ...v, [e.target.id]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tavling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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

  const allFilled = Object.values(values).every((v) => v.trim() !== "");

  if (done) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="w-full max-w-[340px] text-center reveal-in">
          <div className="mb-6 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-sand-light flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <p className="text-[9.5px] tracking-[0.3em] uppercase text-accent font-medium mb-3">
            Anmälan mottagen
          </p>
          <h1 className="font-serif text-[30px] text-primary leading-tight tracking-tight mb-4">
            Tack för ditt deltagande!
          </h1>
          <p className="text-[12.5px] text-granite leading-relaxed">
            Du är nu med i utlottningen av en gratis frukost på Grand Hotel Lysekil. Lycka till!
          </p>
          <div className="mt-8 w-8 h-px bg-accent mx-auto" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-[340px]">
        <div className="text-center mb-10">
          <p className="text-[9.5px] tracking-[0.3em] uppercase text-accent font-medium mb-3">
            Tävling
          </p>
          <h1 className="font-serif text-[32px] text-primary leading-tight tracking-tight">
            Vinn frukost
          </h1>
          <div className="mt-3 mb-4 flex justify-center">
            <div className="w-8 h-px bg-accent" />
          </div>
          <p className="text-[12.5px] text-granite leading-relaxed">
            Fyll i dina uppgifter och delta i utlottningen av en gratis frukost för två på Grand Hotel Lysekil.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {FIELDS.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.id}
                className="text-[9px] tracking-[0.25em] uppercase text-granite font-medium"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
                value={values[field.id]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                className="w-full px-4 py-3 rounded-[4px] border border-sand bg-white text-[14px] text-foreground placeholder:text-granite-light focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}

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
        </form>

        <p className="mt-8 text-center text-[10px] text-granite-light leading-relaxed">
          Grand Hotel Lysekil · Strandvägen 1 · Lysekil
        </p>
      </div>
    </main>
  );
}
