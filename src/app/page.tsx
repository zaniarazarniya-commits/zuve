"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LookupPage() {
  const router = useRouter();
  const [bookingNumber, setBookingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_number: bookingNumber.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Något gick fel, försök igen.");
        return;
      }

      router.push(`/guest/${data.token}`);
    } catch {
      setError("Något gick fel, försök igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-[340px]">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[9.5px] tracking-[0.3em] uppercase text-accent font-medium mb-3">
            Välkommen
          </p>
          <h1 className="font-serif text-[34px] text-primary leading-tight tracking-tight">
            Grand Hotel Lysekil
          </h1>
          <p className="mt-3 text-[12.5px] text-granite leading-relaxed">
            Ange ditt bokningsnummer för att komma till din gästsida.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="booking-number"
              className="text-[9px] tracking-[0.25em] uppercase text-granite font-medium"
            >
              Bokningsnummer
            </label>
            <input
              id="booking-number"
              type="text"
              inputMode="numeric"
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              placeholder="t.ex. 12345"
              required
              className="w-full px-4 py-3 rounded-[4px] border border-sand bg-white text-[14px] text-foreground placeholder:text-granite-light focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-[11.5px] text-red-600 leading-snug">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !bookingNumber.trim()}
            className="w-full py-3.5 rounded-[4px] bg-primary text-white text-[11px] tracking-[0.2em] uppercase font-medium disabled:opacity-50 transition-opacity"
          >
            {loading ? "Söker…" : "Hitta min bokning"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-10 text-center text-[10px] text-granite-light">
          Hittar du inte din bokning?{" "}
          <a
            href="tel:+46523611000"
            className="underline underline-offset-2"
          >
            Ring oss
          </a>
        </p>
      </div>
    </main>
  );
}
