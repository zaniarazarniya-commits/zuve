"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useParams } from "next/navigation";
import { CheckIcon } from "@/components/icons";
import { upsells, activities, restaurants } from "@/lib/guest-data";
import type { Booking } from "@/types/booking";

// Globalt tillval-modal-state
const UpsellModalContext = createContext<{
  activeItem: typeof upsells[0] | null;
  setActiveItem: (item: typeof upsells[0] | null) => void;
}>({ activeItem: null, setActiveItem: () => {} });

// ============================================================
// STEG 0 — Laddning
// ============================================================
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-sand border-t-primary rounded-full animate-spin" />
      <p className="mt-4 text-xs text-granite-light tracking-wide">Laddar din bokning...</p>
    </div>
  );
}

// ============================================================
// STEG 0 — Fel
// ============================================================
function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-8">
      <div className="w-8 h-px bg-sand mx-auto mb-8" />
      <p className="text-sm text-granite font-light mb-2">Något gick fel</p>
      <p className="text-xs text-granite-light text-center max-w-xs">{message}</p>
    </div>
  );
}

// ============================================================
// STEG 1 — Välkomstskärm
// ============================================================
function WelcomeScreen({
  firstName,
  onContinue,
}: {
  firstName: string;
  onContinue: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  // Gästen måste själv klicka "Fortsätt" — inget auto-navigate

  function handleContinue() {
    setIsExiting(true);
    setTimeout(onContinue, 800);
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background ${isExiting ? "reveal-out" : ""}`}>
      <div className="text-center px-8 max-w-sm">
        <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-muted mb-10 reveal-in" style={{ animationDelay: "0.2s" }}>
          Grand Hotel Lysekil
        </p>

        <div className="w-8 h-px bg-sand mx-auto mb-10 line-reveal" style={{ animationDelay: "0.5s" }} />

        <p className="text-sm text-granite font-light tracking-wide mb-4 reveal-in" style={{ animationDelay: "0.8s" }}>
          Välkommen
        </p>

        <h1 className="text-[42px] font-semibold text-foreground leading-[1.1] tracking-tight reveal-in" style={{ animationDelay: "1.1s" }}>
          {firstName}
        </h1>

        <button
          onClick={handleContinue}
          className="mt-16 inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-sand bg-white/60 backdrop-blur-sm text-xs font-medium tracking-[0.2em] uppercase text-primary hover:bg-white hover:border-accent/30 hover:shadow-sm transition-all duration-500 active:scale-[0.98] reveal-in"
          style={{ animationDelay: "1.6s" }}
        >
          Se din bokning
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEG 2 — Uppgiftsformulär
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

  const etaOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 12;
    return `${hour}:00`;
  });

  return (
    <div className="min-h-full px-5 pt-14 pb-8 content-in">
      <div className="max-w-lg mx-auto space-y-10">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-1 w-10 rounded-full bg-primary" />
            <div className="h-1 w-10 rounded-full bg-sand" />
          </div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted">Steg 1 av 2</p>
        </div>

        <div className="text-center">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-muted mb-4">
            Din ankomst
          </p>
          <h2 className="text-[28px] font-semibold text-foreground leading-tight">
            Hjälp oss förbereda<br />din ankomst
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl bg-red-50 px-5 py-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="phone" className="block text-xs font-medium text-granite mb-2">
              Vart når vi dig?
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="070-123 45 67"
              className="w-full rounded-2xl bg-white px-5 py-4 text-sm text-foreground placeholder:text-granite-light/50 shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/15 transition-all duration-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-granite mb-2">
              E-post
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="namn@exempel.se"
              className="w-full rounded-2xl bg-white px-5 py-4 text-sm text-foreground placeholder:text-granite-light/50 shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/15 transition-all duration-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-granite mb-2">
              Beräknad ankomsttid <span className="text-accent">*</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {etaOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEta(t)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    eta === t
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-granite border border-sand hover:border-accent/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {!eta && (
              <p className="mt-1.5 text-[10px] text-granite-light">Välj en tid för att fortsätta</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs font-medium text-granite mb-2">
              Övriga önskemål
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="T.ex. allergier, särskilda önskemål..."
              className="w-full rounded-2xl bg-white px-5 py-4 text-sm text-foreground placeholder:text-granite-light/50 shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/15 transition-all duration-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || isSaving}
            className="w-full py-4 rounded-2xl bg-primary text-white text-sm font-medium transition-all duration-500 disabled:opacity-25 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSaving ? "Sparar..." : "Spara och fortsätt"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// STEG 3 — Bokningsöversikt
// ============================================================
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" });
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================================
// STEG 4 — Tab-vy: Tillval / Lysekil / Restauranger
// ============================================================
type Tab = "upsells" | "activities" | "restaurants";

function ExperienceCard({
  imageUrl,
  title,
  subtitle,
  description,
  tag,
  rightElement,
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
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="relative h-44 overflow-hidden bg-sand-light">
        {/* Skeleton loader */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-sand-light animate-pulse" />
        )}
        {/* Image with fallback */}
        {!imgError ? (
          <img
            src={imageUrl}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-sand-light flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10 text-sand">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {tag && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[10px] font-medium text-primary uppercase tracking-wider">
            {tag}
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground text-[15px]">{title}</h3>
            {subtitle && <p className="text-xs text-granite-light mt-0.5">{subtitle}</p>}
          </div>
          {rightElement}
        </div>
        <p className="text-sm text-granite font-light leading-relaxed">{description}</p>
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
          token,
          extra_id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          currency: item.currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kunde inte skicka intresseanmälan");
      }
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
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-success text-white">
              <CheckIcon className="w-4 h-4" />
              Intresseanmäld
            </span>
          ) : (
            <button
              onClick={() => setActiveItem(item)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-sea-deep transition-all duration-500 active:scale-95"
            >
              {item.price} {item.currency}
            </button>
          )
        }
      />

      {/* Bekräftelsemodal — renderas globalt men knapparna finns här */}
      <UpsellModal token={token} item={item} onConfirm={handleConfirm} />

      {/* Toast feedback efter bekräftelse */}
      {showSuccess && (
        <div className="fixed top-4 left-4 right-4 z-[70] flex justify-center animate-fade-in">
          <div className="bg-success text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-2">
            <CheckIcon className="w-4 h-4" />
            Intresseanmälan skickad till receptionen
          </div>
        </div>
      )}
    </>
  );
}

function UpsellModal({
  token,
  item,
  onConfirm,
}: {
  token: string;
  item: typeof upsells[0];
  onConfirm: () => Promise<void>;
}) {
  const { activeItem, setActiveItem } = useContext(UpsellModalContext);
  const isOpen = activeItem?.id === item.id;
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleClick() {
    setIsAdding(true);
    await onConfirm();
    setIsAdding(false);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 w-full max-w-sm">
        <div className="bg-white rounded-3xl p-6 shadow-xl space-y-5">
          <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
          <p className="text-sm text-granite font-light">
            Önskar du beställa detta hos receptionen?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveItem(null)}
            className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-granite bg-sand-light/30 hover:bg-sand-light/50 transition-all duration-500"
          >
            Nej, tack
          </button>
          <button
            onClick={handleClick}
            disabled={isAdding}
            className="flex-1 py-3.5 rounded-2xl text-sm font-medium bg-primary text-white hover:bg-sea-deep transition-all duration-500 disabled:opacity-50"
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
            className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-sea-deep transition-all duration-500"
          >
            Boka
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
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md pt-2 pb-1">
      <div className="flex items-center justify-center gap-1 max-w-lg mx-auto px-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex-1 py-3 text-xs font-medium tracking-wide rounded-xl transition-all duration-500 ${
              active === tab.key
                ? "bg-primary text-white shadow-sm"
                : "text-granite hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TabContent({ token, activeTab }: { token: string; activeTab: Tab }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {activeTab === "upsells" && upsells.map((item) => <UpsellCard key={item.id} token={token} item={item} />)}
      {activeTab === "activities" && activities.map((item) => <ActivityCard key={item.id} item={item} />)}
      {activeTab === "restaurants" && restaurants.map((item) => <RestaurantCard key={item.id} item={item} />)}
    </div>
  );
}

function ExploreScreen({ token, booking }: { token: string; booking: Booking }) {
  const [activeTab, setActiveTab] = useState<Tab>("upsells");

  return (
    <div className="min-h-full content-in">
      {/* Header */}
      <div className="text-center pt-10 pb-2 px-5">
        <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-muted mb-3">
          Din vistelse
        </p>
        <h2 className="text-[28px] font-semibold text-foreground leading-tight">
          Utforska Lysekil
        </h2>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      <div className="px-5 pt-4 pb-8 max-w-lg mx-auto">
        <TabContent token={token} activeTab={activeTab} />

        <footer className="pt-8 pb-4 text-center space-y-3">
          <div className="w-8 h-px bg-sand mx-auto" />
          <a
            href="https://maps.google.com/?q=Grand+Hotel+Lysekil,+Kungsgatan+36,+Lysekil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-granite-light font-light hover:text-granite transition-colors duration-300 underline decoration-sand underline-offset-2"
          >
            Grand Hotel Lysekil — Kungsgatan 36, 453 33 Lysekil
          </a>
          <a
            href="tel:+46523611000"
            className="inline-flex items-center gap-1.5 text-sm text-sea hover:text-primary transition-colors duration-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            0523-61 10 00
          </a>
          <p className="text-[10px] text-granite-light/60">
            <a href="/privacy" className="underline hover:text-granite-light transition-colors duration-300">
              Integritetspolicy
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

// ============================================================
// HUVUDVY med bottennavigering: Din bokning / Utforska
// ============================================================
type MainView = "booking" | "explore";

function MainScreen({
  token,
  booking,
  onEdit,
}: {
  token: string;
  booking: Booking;
  onEdit: () => void;
}) {
  const [activeView, setActiveView] = useState<MainView>("explore");

  return (
    <div className="min-h-full bg-background relative pb-20">
      {/* Innehåll */}
      <div className="content-in">
        {activeView === "booking" && (
          <div className="px-5 pt-12 pb-8 max-w-lg mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
              <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-muted mb-4">
                Din bokning
              </p>
              <h2 className="text-[28px] font-semibold text-foreground leading-tight">
                {booking.guest_first_name} {booking.guest_last_name}
              </h2>
            </div>

            {/* Bokningskort */}
            <BookingOverviewCard booking={booking} />

            {/* Redigera-knapp */}
            <button
              onClick={onEdit}
              className="w-full py-4 rounded-2xl bg-white border border-sand text-primary text-sm font-medium transition-all duration-500 hover:bg-sand-light/30"
            >
              {booking.eta ? "Redigera dina uppgifter" : "Komplettera din ankomst"}
            </button>
          </div>
        )}

        {activeView === "explore" && (
          <ExploreScreen token={token} booking={booking} />
        )}
      </div>

      {/* Bottennavigering */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-sand-light/60">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <button
            onClick={() => setActiveView("booking")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-500 ${
              activeView === "booking" ? "text-primary" : "text-granite-light"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
            <span className="text-[10px] font-medium tracking-wide">Din bokning</span>
          </button>
          <button
            onClick={() => setActiveView("explore")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-500 ${
              activeView === "explore" ? "text-primary" : "text-granite-light"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span className="text-[10px] font-medium tracking-wide">Utforska</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function BookingOverviewCard({ booking }: { booking: Booking }) {
  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);
  const isCancelled = booking.cancelled;
  const days = daysUntil(booking.check_in_date);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
      {/* Nedräkningsbanner */}
      {!isCancelled && days > 0 && (
        <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-2.5 text-center">
          <p className="text-xs font-medium text-accent">
            {days === 1 ? "1 dag kvar" : `${days} dagar kvar`} till incheckning
          </p>
        </div>
      )}
      {!isCancelled && days === 0 && (
        <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-center">
          <p className="text-xs font-medium text-primary">Välkommen! Idag är din incheckningsdag.</p>
        </div>
      )}

      {/* Avbokningsvarning */}
      {isCancelled && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 font-medium text-center">
          Denna bokning är avbokad
        </div>
      )}

      {/* Bokningsnummer */}
      {booking.sirvoy_booking_id && (
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-granite">Bokningsnummer</p>
          <p className="text-sm font-semibold text-foreground">#{booking.sirvoy_booking_id}</p>
        </div>
      )}

      {/* Datumrad */}
      <div className="flex items-stretch gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-granite mb-1">Incheckning</p>
          <p className="text-base font-semibold text-foreground">{formatDate(booking.check_in_date)}</p>
        </div>
        <div className="flex flex-col items-center justify-center px-1">
          <div className="w-px h-full bg-sand relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-granite-light">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </div>
          </div>
          <span className="text-[10px] text-granite-light font-medium mt-1">{nights} nätter</span>
        </div>
        <div className="flex-1 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-granite mb-1">Utcheckning</p>
          <p className="text-base font-semibold text-foreground">{formatDate(booking.check_out_date)}</p>
        </div>
      </div>

      <div className="h-px bg-sand-light/60" />

      {/* Rum + gäster */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-granite mb-1">Rum</p>
          {booking.sirvoy_room_name ? (
            <>
              <p className="text-sm font-semibold text-foreground">{booking.sirvoy_room_name}</p>
              <p className="text-xs text-granite-light">{booking.sirvoy_room_type}</p>
            </>
          ) : (
            <p className="text-sm text-granite-light italic">Rum tilldelas vid incheckning</p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-granite mb-1">Gäster</p>
          <p className="text-sm font-semibold text-foreground">{booking.number_of_guests} {booking.number_of_guests === 1 ? "person" : "personer"}</p>
        </div>
      </div>

      {/* Gästens ifyllda info */}
      {(booking.guest_phone || booking.guest_email || booking.eta || booking.notes) && (
        <>
          <div className="h-px bg-sand-light/60" />
          <div className="grid grid-cols-2 gap-4">
            {booking.guest_phone && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-granite mb-1">Telefon</p>
                <p className="text-sm text-foreground">{booking.guest_phone}</p>
              </div>
            )}
            {booking.guest_email && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-granite mb-1">E-post</p>
                <p className="text-sm text-foreground">{booking.guest_email}</p>
              </div>
            )}
            {booking.eta && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-granite mb-1">Ankomsttid</p>
                <p className="text-sm text-foreground">{booking.eta}</p>
              </div>
            )}
            {booking.notes && (
              <div className="col-span-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-granite mb-1">Önskemål</p>
                <p className="text-sm text-foreground">{booking.notes}</p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="h-px bg-sand-light/60" />

      {/* Pris + betalningsstatus */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-granite">Totalt</p>
            <p className="text-xl font-semibold text-foreground">{booking.total_price_sek.toLocaleString("sv-SE")} {booking.currency}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/5 text-xs font-medium text-primary">
            {booking.status === "confirmed" ? "Bekräftad" : booking.status}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="w-2 h-2 rounded-full bg-success" />
          <p className="text-xs text-granite font-medium">Betalning sker vid incheckning</p>
        </div>
      </div>
    </div>
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

  // Dynamisk page title
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
        if (!res.ok) {
          throw new Error(data.error || "Kunde inte hämta bokningen");
        }
        setBooking(data.booking);
        // Om gästen redan fyllt i ankomsttid, hoppa direkt till bokningsöversikt
        if (data.booking?.eta) {
          setStep(2);
        }
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
