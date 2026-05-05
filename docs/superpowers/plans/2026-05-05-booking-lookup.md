# Booking Lookup Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a booking lookup page at the root URL so guests can find their portal by entering their Sirvoy booking number.

**Architecture:** A new `POST /api/lookup` route accepts a booking number, queries Supabase for the matching `guest_token`, and returns it. The root page `src/app/page.tsx` is replaced with a client-side form that calls this endpoint and redirects to `/guest/[token]` on success.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Tailwind CSS v4, Supabase (service role), existing `rateLimit` + `getClientIp` from `src/lib/rate-limit.ts`

---

## File Map

- **Create:** `src/app/api/lookup/route.ts` — POST endpoint, booking number → guest_token
- **Replace:** `src/app/page.tsx` — client component, lookup form UI

---

### Task 1: API route — POST /api/lookup

**Files:**
- Create: `src/app/api/lookup/route.ts`

This endpoint accepts `{ booking_number: string }`, rate-limits by IP (10 req/min), queries Supabase for a booking where `sirvoy_booking_id` matches, and returns `{ token: string }` or an error.

- [ ] **Step 1: Create the file with the full implementation**

```ts
// src/app/api/lookup/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const LOOKUP_RATE_LIMIT = { intervalMs: 60_000, maxRequests: 10 }

export async function POST(request: Request) {
  const clientIp = getClientIp(request)
  const limit = rateLimit(`lookup:${clientIp}`, LOOKUP_RATE_LIMIT)
  if (!limit.success) {
    return NextResponse.json(
      { error: "För många försök, vänta en stund." },
      { status: 429 }
    )
  }

  let body: { booking_number?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 })
  }

  const bookingNumber = typeof body.booking_number === "string"
    ? body.booking_number.trim()
    : ""

  if (!bookingNumber) {
    return NextResponse.json(
      { error: "Ange ett bokningsnummer." },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase
    .from("bookings")
    .select("guest_token")
    .eq("sirvoy_booking_id", bookingNumber)
    .single()

  if (error || !data?.guest_token) {
    return NextResponse.json(
      { error: "Ingen bokning hittades med det numret." },
      { status: 404 }
    )
  }

  return NextResponse.json({ token: data.guest_token })
}
```

- [ ] **Step 2: Verify it builds**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — no TypeScript errors. The route `/api/lookup` should appear in the route list.

- [ ] **Step 3: Manually test the endpoint**

Start the dev server: `npm run dev`

Test with a valid booking number (find one in Supabase dashboard):
```bash
curl -X POST http://localhost:3000/api/lookup \
  -H "Content-Type: application/json" \
  -d '{"booking_number":"YOUR_REAL_BOOKING_NUMBER"}'
```
Expected: `{"token":"<uuid-like-string>"}`

Test with an invalid number:
```bash
curl -X POST http://localhost:3000/api/lookup \
  -H "Content-Type: application/json" \
  -d '{"booking_number":"00000"}'
```
Expected: `{"error":"Ingen bokning hittades med det numret."}` with status 404.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/lookup/route.ts
git commit -m "feat: add POST /api/lookup endpoint for booking number lookup"
```

---

### Task 2: Root page — booking lookup form

**Files:**
- Replace: `src/app/page.tsx`

Replace the existing broken page with a clean lookup form. Matches the Claude Design visual language: Inter body font, Cormorant Garamond serif headings, `rounded-[4px]` corners, `--primary`/`--accent` color tokens, `--background` page background.

- [ ] **Step 1: Replace src/app/page.tsx with the lookup form**

```tsx
// src/app/page.tsx
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
```

- [ ] **Step 2: Verify it builds**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — no TypeScript errors. Route `/` should appear as `○ (Static)` in the build output.

- [ ] **Step 3: Test in browser**

Start dev server: `npm run dev`

1. Open `http://localhost:3000/` — should see the Grand Hotel Lysekil heading, a booking number input, and a "Hitta min bokning" button.
2. Submit with an empty field — button should stay disabled.
3. Submit with `00000` — should show "Ingen bokning hittades med det numret." in red below the input.
4. Submit with a real booking number from Supabase — should redirect to `/guest/[token]` and show the guest portal.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: replace root page with booking number lookup form"
```
