"use client";

import { useState } from "react";
import { CheckIcon } from "./icons";

export interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  icon: React.ReactNode;
  tag?: string;
}

export default function UpsellCard({ item }: { item: UpsellItem }) {
  const [requested, setRequested] = useState(false);

  return (
    <div className="group relative rounded-2xl bg-white border border-sand-light/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-sea/20">
      {/* Bild */}
      <div className="relative h-44 overflow-hidden bg-sand-light">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${item.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {item.tag && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-sea-deep uppercase tracking-wide shadow-sm">
            {item.tag}
          </span>
        )}

        {/* Ikon-badg */}
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-sea shadow-sm">
          {item.icon}
        </div>
      </div>

      {/* Innehåll */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground text-[15px] leading-snug">
              {item.title}
            </h3>
            <p className="text-sm text-granite mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-lg font-bold text-sea-deep">
              {item.price.toLocaleString("sv-SE")} {item.currency}
            </span>
          </div>

          <button
            onClick={() => setRequested(!requested)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
              requested
                ? "bg-sea-deep text-white"
                : "bg-sea text-white hover:bg-sea-deep shadow-sm hover:shadow"
            }`}
          >
            <span
              className={`flex items-center gap-1.5 transition-opacity duration-200 ${
                requested ? "opacity-0" : "opacity-100"
              }`}
            >
              Intresseanmälan
            </span>
            {requested && (
              <span className="absolute inset-0 flex items-center justify-center gap-1.5">
                <CheckIcon className="w-4 h-4" />
                Tillagd
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
