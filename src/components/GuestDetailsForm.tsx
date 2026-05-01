"use client";

import { useState, useTransition } from "react";
import { CheckIcon } from "./icons";
import type { Booking } from "@/types/booking";

interface GuestDetailsFormProps {
  booking: Booking;
  onUpdate?: (updated: Booking) => void;
}

export default function GuestDetailsForm({
  booking,
  onUpdate,
}: GuestDetailsFormProps) {
  const [email, setEmail] = useState(booking.guest_email ?? "");
  const [phone, setPhone] = useState("");
  const [eta, setEta] = useState(booking.eta ?? "");
  const [notes, setNotes] = useState(booking.notes ?? "");

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Vilka fält är redan ifyllda?
  const hasEmail = Boolean(booking.guest_email);
  const hasPhone = Boolean(booking.guest_phone);
  const hasEta = Boolean(booking.eta);

  // Visa ingenting om allt redan finns
  if (hasEmail && hasPhone && hasEta) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    startTransition(async () => {
      try {
        // TODO: byt ut mot dynamisk token från URL
        const token = window.location.pathname.split("/").pop() ?? "";

        const payload: Record<string, string> = {};
        if (!hasEmail && email) payload.guest_email = email;
        if (!hasPhone && phone) payload.guest_phone = phone;
        if (!hasEta && eta) payload.eta = eta;
        if (notes) payload.notes = notes;

        const res = await fetch(`/api/guest/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Kunde inte spara");
        }

        const data = await res.json();
        setSaved(true);
        onUpdate?.(data.booking);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm border border-sea/10">
      <h3 className="text-base font-semibold text-foreground mb-1">
        Komplettera din bokning
      </h3>
      <p className="text-sm text-granite mb-5">
        Hjälp oss göra din vistelse perfekt — fyll i det som saknas.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!hasEmail && (
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-granite mb-1.5"
            >
              E-post
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.se"
              className="w-full rounded-xl border border-sand-light bg-warm-white px-4 py-3 text-sm text-foreground placeholder:text-granite-light focus:outline-none focus:ring-2 focus:ring-sea/30 focus:border-sea transition-all"
            />
          </div>
        )}

        {!hasPhone && (
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-medium text-granite mb-1.5"
            >
              Telefon
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="070-123 45 67"
              className="w-full rounded-xl border border-sand-light bg-warm-white px-4 py-3 text-sm text-foreground placeholder:text-granite-light focus:outline-none focus:ring-2 focus:ring-sea/30 focus:border-sea transition-all"
            />
          </div>
        )}

        {!hasEta && (
          <div>
            <label
              htmlFor="eta"
              className="block text-xs font-medium text-granite mb-1.5"
            >
              Beräknad ankomst
            </label>
            <input
              id="eta"
              type="time"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="w-full rounded-xl border border-sand-light bg-warm-white px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sea/30 focus:border-sea transition-all"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="notes"
            className="block text-xs font-medium text-granite mb-1.5"
          >
            Övriga önskemål
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="T.ex. allergier, särskilda önskemål..."
            className="w-full rounded-xl border border-sand-light bg-warm-white px-4 py-3 text-sm text-foreground placeholder:text-granite-light focus:outline-none focus:ring-2 focus:ring-sea/30 focus:border-sea transition-all resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {saved && (
          <div className="flex items-center gap-2 text-sm text-sea-deep bg-sea-mist/30 px-3 py-2 rounded-lg">
            <CheckIcon className="w-4 h-4" />
            Sparat! Tack för att du hjälper oss.
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-sea-deep text-white text-sm font-semibold hover:bg-sea transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isPending ? "Sparar..." : "Spara uppgifter"}
        </button>
      </form>
    </section>
  );
}
