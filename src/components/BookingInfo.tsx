"use client";

import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  HomeIcon,
  MapPinIcon,
  MoonIcon,
} from "./icons";
import type { Booking } from "@/types/booking";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
  });
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function BookingInfo({ booking }: { booking: Booking }) {
  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);

  return (
    <section className="space-y-5">
      {/* Datum-rad */}
      <div className="flex items-stretch gap-3">
        <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm border border-sand-light/60">
          <div className="flex items-center gap-2 text-sea text-xs font-medium uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Incheckning</span>
          </div>
          <p className="text-foreground font-semibold text-lg leading-tight">
            {formatDate(booking.check_in_date)}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center px-1">
          <div className="w-px h-full bg-sand relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-1">
              <MoonIcon className="w-4 h-4 text-granite-light" />
            </div>
          </div>
          <span className="text-[11px] text-granite-light font-medium mt-1">
            {nights} nätter
          </span>
        </div>

        <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm border border-sand-light/60">
          <div className="flex items-center gap-2 text-sea text-xs font-medium uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Uteckning</span>
          </div>
          <p className="text-foreground font-semibold text-lg leading-tight">
            {formatDate(booking.check_out_date)}
          </p>
        </div>
      </div>

      {/* Detaljer-kort */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-sand-light/60 space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Dina uppgifter
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-xl bg-sea-mist/40 text-sea">
              <HomeIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-granite">Rum</p>
              <p className="text-sm font-medium text-foreground">
                {booking.sirvoy_room_name}
              </p>
              <p className="text-xs text-granite-light">{booking.sirvoy_room_type}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-xl bg-sea-mist/40 text-sea">
              <UsersIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-granite">Gäster</p>
              <p className="text-sm font-medium text-foreground">
                {booking.number_of_guests} {" "}
                {booking.number_of_guests === 1 ? "person" : "personer"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-xl bg-sea-mist/40 text-sea">
              <ClockIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-granite">Beräknad ankomst</p>
              <p className="text-sm font-medium text-foreground">{booking.eta}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-xl bg-sea-mist/40 text-sea">
              <MapPinIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-granite">Våning</p>
              <p className="text-sm font-medium text-foreground">
                {booking.rooms.floor}
              </p>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div className="mt-4 p-3 rounded-xl bg-sand-light/40 border border-sand/30">
            <p className="text-xs text-granite font-medium mb-1">Anteckningar</p>
            <p className="text-sm text-foreground">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Pris */}
      <div className="flex items-center justify-between rounded-2xl bg-sea-deep p-5 text-white">
        <div>
          <p className="text-xs text-sea-light font-medium uppercase tracking-wider">
            Totalt pris
          </p>
          <p className="text-2xl font-bold mt-0.5">
            {booking.total_price_sek.toLocaleString("sv-SE")} {booking.currency}
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium">
          {booking.status === "confirmed" ? "Bekräftad" : booking.status}
        </div>
      </div>
    </section>
  );
}
