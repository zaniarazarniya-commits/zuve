"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useParams } from "next/navigation";
import { CheckIcon } from "@/components/icons";
import { WeatherWidget } from "@/components/WeatherWidget";
import { upsells, activities, restaurants } from "@/lib/guest-data";
import type { Booking } from "@/types/booking";

// ============================================================
// Modal-context (oförändrat)
// ============================================================
const UpsellModalContext = createContext<{
  activeItem: typeof upsells[0] | null;
  setActiveItem: (item: typeof upsells[0] | null) => void;
}>({ activeItem: null, setActiveItem: () => {} });

// ============================================================
// Hjälpare
// ============================================================
function formatLongDate(dateString: string) {
  const d = new Date(dateString);
  return {
    day: d.toLocaleDateString("sv-SE", { day: "numeric" }),
    month: d.toLocaleDateString("sv-SE", { month: "long" }),
    year: d.toLocaleDateString("sv-SE", { year: "numeric" }),
    weekday: d.toLocaleDateString("sv-SE", { weekday: "long" }),
  };
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateString}T00:00:00`);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================================
// Loading / Error
// ============================================================
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="w-px h-8 bg-accent animate-pulse" />
      <p className="mt-6 text-[10px] tracking-[0.3em] uppercase text-muted">Laddar din bokning</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-8">
      <div className="w-8 h-px bg-accent mx-auto mb-8" />
      <p className="font-serif text-2xl text-primary mb-3">Något gick fel</p>
      <p className="text-sm text-granite text-center max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}

// ============================================================
// STEG 1 — Välkomst
// ============================================================
function WelcomeScreen({
  firstName,
  onContinue,
}: {
  firstName: string;
  onContinue: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  function handleContinue() {
    setIsExiting(true);
    setTimeout(onContinue, 800);
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-background px-8 pt-16 pb-12 ${isExiting ? "reveal-out" : ""}`}>
      {/* Top crest */}
      <div className="flex flex-col items-center gap-2.5 reveal-in" style={{ animationDelay: "0.2s" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.2">
          <path d="M12 2 L13.5 9 L21 10 L15.5 14.5 L17 21 L12 17 L7 21 L8.5 14.5 L3 10 L10.5 9 Z" />
        </svg>
        <p className="font-serif text-[13px] tracking-[0.32em] uppercase text-primary font-medium">
          Grand Hotel Lysekil
        </p>
        <p className="text-[9.5px] tracking-[0.24em] uppercase text-muted">
          Est. 1934 · Bohuslän
        </p>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center text-center -mt-10">
        <div className="w-8 h-px bg-accent mb-8 line-reveal" style={{ animationDelay: "0.5s" }} />
        <p className="font-serif italic text-lg text-granite mb-3.5 font-light reveal-in" style={{ animationDelay: "0.8s" }}>
          Välkommen
        </p>
        <h1 className="font-serif text-[64px] leading-none text-primary tracking-tight reveal-in" style={{ animationDelay: "1.1s" }}>
          {firstName}
        </h1>
        <p className="text-xs text-muted mt-5 tracking-wide reveal-in" style={{ animationDelay: "1.4s" }}>
          Vi ser fram emot din vistelse
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 w-full reveal-in" style={{ animationDelay: "1.7s" }}>
        <button
          onClick={handleContinue}
          className="w-full bg-primary text-background py-[17px] flex items-center justify-center gap-3 text-[11px] tracking-[0.28em] uppercase font-medium rounded-[4px] transition-all duration-500 active:scale-[0.98] hover:bg-sea-deep"
        >
          <span>Se din bokning</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
        <p className="text-[10px] tracking-[0.18em] uppercase text-granite-light">
          Kungsgatan 36 · 453 33 Lysekil
        </p>
      </div>
    </div>
  );
}

// ============================================================
// STEG 2 — Ankomstformulär
// ============================================================
function DetailsFormScreen({
  token,
  initialPhone,
  initialEmail,
  initialEta,
  initialNotes,
  onSaved,
}: {
  token: string;
  initialPhone?: string | null;
  initialEmail?: string | null;
  initialEta?: string | null;
  initialNotes?: string | null;
  onSaved: () => void;
}) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [eta, setEta] = useState(initialEta ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isValid = eta !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/guest/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_phone: phone, guest_email: email, eta, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kunde inte spara uppgifterna");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setIsSaving(false);
    }
  }

  const etaOptions = [
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "Senare ikväll",
  ];

  return (
    <div className="min-h-full bg-background flex flex-col content-in">
      {/* Header */}
      <div className="px-7 pt-12 pb-6 max-w-lg mx-auto w-full">
        <p className="text-[9.5px] tracking-[0.3em] uppercase text-accent font-medium mb-3">
          Steg 2 av 3
        </p>
        <h1 className="font-serif text-[30px] leading-tight text-primary">
          Hjälp oss att<br />förbereda din ankomst
        </h1>
        <p className="text-[13px] text-granite mt-3 leading-relaxed">
          Några korta detaljer hjälper oss att skräddarsy din vistelse.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-7 pb-6 flex-1 flex flex-col gap-5 max-w-lg mx-auto w-full">
        {error && (
          <div className="bg-red-50 px-4 py-3 text-xs text-red-600 rounded-[4px]">{error}</div>
        )}

        <FormField label="Telefonnummer" hint="För smidig kommunikation under vistelsen">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="070-123 45 67"
            className="form-input"
          />
        </FormField>

        <FormField label="E-post" hint="Bekräftelse och kvitton skickas hit">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="namn@exempel.se"
            className="form-input"
          />
        </FormField>

        <FormField label="Beräknad ankomsttid" hint="Incheckning från kl 15:00" required>
          <div className="relative">
            <select
              required
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="form-input appearance-none cursor-pointer pr-11"
            >
              <option value="" disabled>Välj tid</option>
              {etaOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9da0a3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </FormField>

        <FormField label="Önskemål" hint="Allergier, kuddtyp, firande — vi noterar gärna">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="T.ex. allergier, särskilda önskemål..."
            className="form-input resize-none min-h-[88px] py-3.5 leading-relaxed"
          />
        </FormField>

        <div className="mt-auto pt-4 flex flex-col gap-3 items-center">
          <button
            type="submit"
            disabled={!isValid || isSaving}
            className="w-full bg-primary text-background py-[17px] text-[11px] tracking-[0.28em] uppercase font-medium rounded-[4px] transition-all duration-500 active:scale-[0.98] hover:bg-sea-deep disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSaving ? "Sparar..." : "Spara och fortsätt"}
          </button>
          <p className="text-[10px] text-granite-light text-center">
            Dina uppgifter behandlas konfidentiellt enligt vår integritetspolicy.
          </p>
        </div>
      </form>

      <style jsx>{`
        .form-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid rgba(212, 200, 184, 0.6);
          border-radius: 4px;
          padding: 15px 16px;
          font-size: 14px;
          color: #1a3a4a;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          box-shadow: 0 1px 0 rgba(26, 58, 74, 0.02);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .form-input:focus {
          border-color: rgba(201, 169, 110, 0.6);
          box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.12);
        }
        .form-input::placeholder { color: rgba(157, 160, 163, 0.7); }
      `}</style>
    </div>
  );
}

function FormField({
  label, hint, required, children,
}: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] tracking-[0.22em] uppercase text-granite font-medium">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </span>
      {children}
      {hint && (
        <p className="font-serif italic text-[13px] text-granite-light m-0 mt-0.5">{hint}</p>
      )}
    </div>
  );
}

// ============================================================
// STEG 3 — Bokningsöversikt (kort)
// ============================================================
function BookingOverviewCard({ booking }: { booking: Booking }) {
  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);
  const isCancelled = booking.cancelled;
  const checkIn = formatLongDate(booking.check_in_date);
  const checkOut = formatLongDate(booking.check_out_date);
  const days = daysUntil(booking.check_in_date);

  return (
    <div className="bg-white rounded-md p-6 border border-sand/50" style={{ boxShadow: "0 1px 0 rgba(26,58,74,0.04), 0 8px 32px rgba(26,58,74,0.05)" }}>
      {isCancelled && (
        <div className="rounded-[4px] bg-red-50 px-4 py-3 text-sm text-red-600 font-medium text-center mb-5">
          Denna bokning är avbokad
        </div>
      )}

      {/* Nedräkning */}
      {!isCancelled && days > 0 && (
        <div className="rounded-[4px] border border-accent/20 bg-accent/8 px-4 py-2.5 text-center mb-5">
          <p className="text-[11px] tracking-[0.18em] uppercase font-medium text-accent">
            {days === 1 ? "1 dag kvar" : `${days} dagar kvar`} till incheckning
          </p>
        </div>
      )}
      {!isCancelled && days === 0 && (
        <div className="rounded-[4px] border border-primary/20 bg-primary/8 px-4 py-2.5 text-center mb-5">
          <p className="text-[11px] tracking-[0.18em] uppercase font-medium text-primary">
            Välkommen! Idag är din incheckningsdag.
          </p>
        </div>
      )}

      {/* Datum-strip */}
      <div className="flex justify-between items-stretch gap-2">
        <div className="flex flex-col flex-1">
          <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-2">Incheckning</p>
          <p className="font-serif text-[44px] leading-none text-primary tracking-tight">{checkIn.day}</p>
          <p className="text-[11px] text-primary mt-1 font-medium tracking-wide capitalize">{checkIn.month} {checkIn.year}</p>
          <p className="text-[10px] text-granite-light mt-0.5 capitalize">{checkIn.weekday} · 15:00</p>
        </div>

        <div className="flex flex-col items-center pt-6 min-w-[60px]">
          <p className="font-serif text-[22px] leading-none text-accent">{nights}</p>
          <p className="text-[8.5px] tracking-[0.24em] uppercase text-muted font-medium mt-1">{nights === 1 ? "natt" : "nätter"}</p>
          <div className="flex items-center gap-1 mt-3.5 w-full">
            <span className="w-1 h-1 rounded-full bg-accent" />
            <span className="flex-1 h-px bg-accent/40" />
            <span className="w-1 h-1 rounded-full bg-accent" />
          </div>
        </div>

        <div className="flex flex-col flex-1 text-right">
          <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-2">Utcheckning</p>
          <p className="font-serif text-[44px] leading-none text-primary tracking-tight">{checkOut.day}</p>
          <p className="text-[11px] text-primary mt-1 font-medium tracking-wide capitalize">{checkOut.month} {checkOut.year}</p>
          <p className="text-[10px] text-granite-light mt-0.5 capitalize">{checkOut.weekday} · 11:00</p>
        </div>
      </div>

      <div className="h-px bg-sand-light/70 my-6" />

      {/* Bokningsnummer */}
      {booking.sirvoy_booking_id && (
        <>
          <div>
            <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-1.5">Bokningsnummer</p>
            <p className="text-sm text-primary font-medium tracking-wide">#{booking.sirvoy_booking_id}</p>
          </div>
          <div className="h-px bg-sand-light/70 my-6" />
        </>
      )}

      {/* Rum */}
      <div>
        <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-1.5">Rum</p>
        {booking.sirvoy_room_name ? (
          <>
            <p className="font-serif text-[22px] text-primary leading-tight">{booking.sirvoy_room_name}</p>
            <p className="text-[12px] text-granite mt-1 leading-relaxed">{booking.sirvoy_room_type}</p>
          </>
        ) : (
          <p className="text-sm text-granite-light italic">Rum tilldelas vid incheckning</p>
        )}
      </div>

      <div className="h-px bg-sand-light/70 my-6" />

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-[18px]">
        <div>
          <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-1.5">Gäster</p>
          <p className="text-sm text-primary font-medium">{booking.number_of_guests} {booking.number_of_guests === 1 ? "person" : "personer"}</p>
        </div>
        {booking.eta && (
          <div>
            <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-1.5">Ankomsttid</p>
            <p className="text-sm text-primary font-medium">{booking.eta}</p>
          </div>
        )}
        {booking.guest_phone && (
          <div>
            <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-1.5">Telefon</p>
            <p className="text-sm text-primary">{booking.guest_phone}</p>
          </div>
        )}
        {booking.guest_email && (
          <div>
            <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-1.5">E-post</p>
            <p className="text-sm text-primary truncate">{booking.guest_email}</p>
          </div>
        )}
        {booking.notes && (
          <div className="col-span-2">
            <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-1.5">Önskemål</p>
            <p className="text-sm text-primary leading-relaxed">{booking.notes}</p>
          </div>
        )}
      </div>

      <div className="h-px bg-sand-light/70 my-6" />

      {/* Pris + status */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] tracking-[0.24em] uppercase text-muted font-medium mb-1.5">Totalt</p>
          <p className="font-serif text-[30px] leading-none text-primary tracking-tight">
            {booking.total_price_sek.toLocaleString("sv-SE")}
            <span className="text-sm text-granite tracking-wider ml-1.5 font-sans">{booking.currency}</span>
          </p>
          <p className="text-[10.5px] text-granite-light mt-1">{nights} nätter inkl. moms</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[10px] tracking-[0.18em] uppercase font-semibold">
            {booking.status === "confirmed" ? "Bekräftad" : booking.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3">
        <p className="text-xs text-granite font-medium">Betalning sker vid incheckning</p>
      </div>
    </div>
  );
}

// ============================================================
// STEG 4 — Tabs / Tillval / Aktiviteter / Restauranger
// ============================================================
type Tab = "upsells" | "activities" | "restaurants";

function ExperienceCard({
  imageUrl, title, subtitle, description, tag, rightElement,
}: {
  imageUrl: string;
  title: string;
  subtitle?: string;
  description: string;
  tag?: string;
  rightElement?: React.ReactNode;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-md overflow-hidden border border-sand/40" style={{ boxShadow: "0 1px 0 rgba(26,58,74,0.04), 0 6px 24px rgba(26,58,74,0.04)" }}>
      <div className="relative w-full aspect-[16/10] bg-sand-light overflow-hidden">
        {!imgLoaded && !imgError && <div className="absolute inset-0 bg-sand-light animate-pulse" />}
        {!imgError ? (
          <img
            src={imageUrl}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10 text-sand">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/15 to-transparent" />
        {tag && (
          <span className="absolute top-3 left-3 bg-white/95 text-primary px-2.5 py-1 text-[9px] tracking-[0.22em] uppercase font-semibold rounded-full backdrop-blur-sm">
            {tag}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <h3 className="font-serif text-[20px] leading-tight text-primary">{title}</h3>
          {subtitle && (
            <span className="text-[9.5px] tracking-[0.18em] uppercase text-muted whitespace-nowrap font-medium shrink-0">
              {subtitle}
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-granite leading-relaxed">{description}</p>
        {rightElement && <div className="mt-3.5">{rightElement}</div>}
      </div>
    </div>
  );
}

function UpsellCard({ token, item }: { token: string; item: typeof upsells[0] }) {
  const { setActiveItem } = useContext(UpsellModalContext);
  const [added, setAdded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleConfirm() {
    try {
      const res = await fetch("/api/extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, extra_id: item.id, title: item.title,
          description: item.description, price: item.price, currency: item.currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kunde inte skicka intresseanmälan");
      setAdded(true);
      setActiveItem(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Kunde inte skicka intresseanmälan");
    }
  }

  return (
    <>
      <ExperienceCard
        imageUrl={item.imageUrl}
        title={item.title}
        description={item.description}
        tag={item.tag}
        rightElement={
          added ? (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-success text-white text-[10px] tracking-[0.22em] uppercase font-medium rounded-[4px]">
              <CheckIcon className="w-4 h-4" />
              Intresseanmäld
            </span>
          ) : (
            <button
              onClick={() => setActiveItem(item)}
              className="inline-flex items-center gap-3 bg-primary text-background px-4 py-2.5 rounded-[4px] hover:bg-sea-deep transition-all duration-500 active:scale-95"
            >
              <span className="text-[10px] tracking-[0.24em] uppercase font-medium">Lägg till</span>
              <span className="font-serif text-[14px] pl-3 border-l border-background/30">
                {item.price} {item.currency}
              </span>
            </button>
          )
        }
      />

      <UpsellModal token={token} item={item} onConfirm={handleConfirm} />

      {showSuccess && (
        <div className="fixed top-4 left-4 right-4 z-[70] flex justify-center animate-fade-in">
          <div className="bg-success text-white px-5 py-3 rounded-[4px] shadow-lg text-sm font-medium flex items-center gap-2">
            <CheckIcon className="w-4 h-4" />
            Intresseanmälan skickad till receptionen
          </div>
        </div>
      )}
    </>
  );
}

function UpsellModal({
  token: _token, item, onConfirm,
}: {
  token: string;
  item: typeof upsells[0];
  onConfirm: () => Promise<void>;
}) {
  const { activeItem, setActiveItem } = useContext(UpsellModalContext);
  const isOpen = activeItem?.id === item.id;
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleClick() {
    setIsAdding(true);
    await onConfirm();
    setIsAdding(false);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-primary/40 backdrop-blur-sm animate-fade-in">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 w-full max-w-sm">
        <div className="bg-white rounded-md p-7 shadow-2xl">
          <div className="text-center space-y-2 mb-6">
            <div className="w-6 h-px bg-accent mx-auto mb-4" />
            <h3 className="font-serif text-[24px] text-primary leading-tight">{item.title}</h3>
            <p className="text-sm text-granite leading-relaxed">
              Önskar du beställa detta hos receptionen?
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveItem(null)}
              className="flex-1 py-3.5 rounded-[4px] text-[10px] tracking-[0.22em] uppercase font-medium text-granite border border-sand/60 hover:bg-sand-light/40 transition-all duration-500"
            >
              Nej, tack
            </button>
            <button
              onClick={handleClick}
              disabled={isAdding}
              className="flex-1 py-3.5 rounded-[4px] text-[10px] tracking-[0.22em] uppercase font-medium bg-primary text-background hover:bg-sea-deep transition-all duration-500 disabled:opacity-50"
            >
              {isAdding ? "Skickar..." : "Ja, tack"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantCard({ item }: { item: typeof restaurants[0] }) {
  return (
    <ExperienceCard
      imageUrl={item.imageUrl}
      title={item.name}
      subtitle={[item.cuisine, item.distance].filter(Boolean).join(" · ")}
      description={item.description}
      rightElement={
        item.phone ? (
          <a
            href={`tel:${item.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 border border-primary/25 text-primary px-4 py-2.5 rounded-[4px] text-[10.5px] tracking-[0.2em] uppercase font-medium hover:bg-primary hover:text-background transition-all duration-500"
          >
            Boka bord
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </a>
        ) : undefined
      }
    />
  );
}

function ActivityCard({ item }: { item: typeof activities[0] }) {
  return (
    <ExperienceCard
      imageUrl={item.imageUrl}
      title={item.title}
      description={item.description}
      tag={item.tag}
      rightElement={
        item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-primary/25 text-primary px-4 py-2.5 rounded-[4px] text-[10.5px] tracking-[0.2em] uppercase font-medium hover:bg-primary hover:text-background transition-all duration-500"
          >
            Läs mer
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </a>
        ) : undefined
      }
    />
  );
}

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "upsells", label: "Tillval" },
    { key: "activities", label: "Lysekil" },
    { key: "restaurants", label: "Restauranger" },
  ];

  return (
    <div className="sticky top-0 z-40 bg-background/92 backdrop-blur-md border-b border-sand/40">
      <div className="flex max-w-lg mx-auto px-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-1 relative py-3.5 text-[10.5px] tracking-[0.24em] uppercase font-medium transition-colors duration-300"
            style={{ color: active === tab.key ? "#1a3a4a" : "#8a7f72" }}
          >
            <span>{tab.label}</span>
            {active === tab.key && (
              <span className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-8 h-[1.5px] bg-accent" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function TabContent({ token, activeTab }: { token: string; activeTab: Tab }) {
  return (
    <div className="space-y-[18px] animate-fade-in">
      {activeTab === "upsells" && upsells.map((item) => <UpsellCard key={item.id} token={token} item={item} />)}
      {activeTab === "activities" && activities.map((item) => <ActivityCard key={item.id} item={item} />)}
      {activeTab === "restaurants" && restaurants.map((item) => <RestaurantCard key={item.id} item={item} />)}
    </div>
  );
}

function ExploreScreen({ token }: { token: string; booking: Booking }) {
  const [activeTab, setActiveTab] = useState<Tab>("upsells");

  return (
    <div className="min-h-full content-in">
      {/* Header */}
      <div className="text-center pt-10 pb-5 px-7">
        <p className="text-[9.5px] tracking-[0.3em] uppercase text-accent font-medium mb-2.5">
          Din vistelse
        </p>
        <h2 className="font-serif text-[32px] text-primary leading-tight tracking-tight mb-2.5">
          Utforska Lysekil
        </h2>
        <p className="text-[12.5px] text-granite leading-relaxed max-w-[280px] mx-auto mb-4">
          Handplockade upplevelser, från hotellet och staden runt om.
        </p>
        <WeatherWidget />
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      <div className="px-5 pt-5 pb-8 max-w-lg mx-auto">
        <TabContent token={token} activeTab={activeTab} />

        <footer className="pt-10 pb-4 text-center flex flex-col items-center gap-1.5">
          <div className="w-6 h-px bg-accent mb-2" />
          <p className="text-[9.5px] tracking-[0.3em] uppercase text-muted font-medium">
            Receptionen
          </p>
          <p className="text-[11.5px] text-granite mt-0.5">
            Vi hjälper gärna till med bokningar, transport och tips.
          </p>
          <a
            href="tel:+46523611000"
            className="font-serif text-[17px] text-primary mt-1.5 tracking-wide hover:text-sea transition-colors"
          >
            0523 · 61 10 00
          </a>
          <p className="text-[10px] text-granite-light mt-3">
            <a href="/privacy" className="underline hover:text-granite transition-colors">
              Integritetspolicy
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

// ============================================================
// HUVUDVY (booking + explore med bottennav)
// ============================================================
type MainView = "booking" | "explore";

function MainScreen({
  token, booking, onEdit,
}: {
  token: string; booking: Booking; onEdit: () => void;
}) {
  const [activeView, setActiveView] = useState<MainView>("explore");

  return (
    <div className="min-h-full bg-background relative pb-20">
      <div className="content-in">
        {activeView === "booking" && (
          <>
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-sand/40">
              <button className="w-8 h-8 flex items-center justify-center text-primary" aria-label="Meny">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
              <p className="font-serif text-[12px] tracking-[0.28em] uppercase text-primary font-medium">
                Grand Hotel Lysekil
              </p>
              <div className="w-8" />
            </div>

            <div className="px-6 pt-7 pb-6 max-w-lg mx-auto space-y-7">
              <div className="text-center">
                <p className="text-[9.5px] tracking-[0.3em] uppercase text-accent font-medium mb-2.5">
                  Din bokning
                </p>
                <h2 className="font-serif text-[28px] leading-tight text-primary tracking-tight">
                  {booking.guest_first_name} {booking.guest_last_name}
                </h2>
              </div>

              <BookingOverviewCard booking={booking} />

              <button
                onClick={onEdit}
                className="w-full py-[15px] rounded-[4px] bg-white border border-sand/60 text-primary text-[10.5px] tracking-[0.22em] uppercase font-medium hover:bg-sand-light/40 transition-all duration-500"
              >
                {booking.eta ? "Redigera dina uppgifter" : "Komplettera din ankomst"}
              </button>

              <p className="text-[10.5px] text-muted text-center pt-1">
                Frågor? Vi finns på 0523-61 10 00 dygnet runt
              </p>
            </div>
          </>
        )}

        {activeView === "explore" && (
          <ExploreScreen token={token} booking={booking} />
        )}
      </div>

      {/* Bottennav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-md border-t border-sand/40">
        <div className="flex items-center max-w-lg mx-auto px-6">
          <BottomNavBtn
            active={activeView === "booking"}
            onClick={() => setActiveView("booking")}
            label="Bokning"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            }
          />
          <BottomNavBtn
            active={activeView === "explore"}
            onClick={() => setActiveView("explore")}
            label="Utforska"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m16 8-4 8-4-2 2-4 6-2z" />
              </svg>
            }
          />
        </div>
      </nav>
    </div>
  );
}

function BottomNavBtn({
  active, onClick, label, icon,
}: {
  active: boolean; onClick: () => void; label: string; icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1.5 py-3 transition-colors duration-300"
      style={{ color: active ? "#1a3a4a" : "#9da0a3" }}
    >
      {icon}
      <span className={`text-[9.5px] tracking-[0.18em] uppercase ${active ? "font-semibold" : "font-normal"}`}>
        {label}
      </span>
    </button>
  );
}

// ============================================================
// HUVUDSIDA
// ============================================================
export default function GuestPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [activeItem, setActiveItem] = useState<typeof upsells[0] | null>(null);

  useEffect(() => {
    if (booking) {
      document.title = `${booking.guest_first_name} — Grand Hotel Lysekil`;
    } else {
      document.title = "Grand Hotel Lysekil — Din vistelse";
    }
  }, [booking]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Saknad bokningslänk. Kontrollera att du har klickat på rätt länk.");
      return;
    }

    async function fetchBooking() {
      try {
        const res = await fetch(`/api/guest/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Kunde inte hämta bokningen");
        setBooking(data.booking);
        if (data.booking?.eta) setStep(2);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [token]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!booking) return <ErrorScreen message="Bokningen hittades inte. Länken kan vara felaktig eller utgången." />;

  return (
    <UpsellModalContext.Provider value={{ activeItem, setActiveItem }}>
      <main className="min-h-full bg-background relative">
        {step >= 2 && <MainScreen token={token!} booking={booking} onEdit={() => setStep(1)} />}
        {step >= 1 && step < 2 && (
          <DetailsFormScreen
            token={token!}
            initialPhone={booking.guest_phone}
            initialEmail={booking.guest_email}
            initialEta={booking.eta}
            initialNotes={booking.notes}
            onSaved={() => setStep(2)}
          />
        )}
        {step === 0 && (
          <WelcomeScreen firstName={booking.guest_first_name} onContinue={() => setStep(1)} />
        )}
      </main>
    </UpsellModalContext.Provider>
  );
}
