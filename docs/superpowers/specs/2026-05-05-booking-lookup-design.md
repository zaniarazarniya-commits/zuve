# Booking Lookup Page — Design Spec

## Goal

Replace the broken root page at `/` with a booking lookup form where guests can find their portal by entering their Sirvoy booking number.

## Architecture

**Root page `/` (`src/app/page.tsx`)** — client component with a single text input and submit button. On submit, calls `POST /api/lookup`. On success, redirects to `/guest/[token]` using `useRouter`. On error, shows inline error message.

**API route `POST /api/lookup` (`src/app/api/lookup/route.ts`)** — accepts `{ booking_number: string }`, queries Supabase for a booking matching `sirvoy_booking_id`, returns `{ token: string }` on match or 404 with `{ error: string }` if not found. Rate-limited per IP: max 10 requests/minute (uses existing `rateLimit` from `src/lib/rate-limit.ts`).

## Data Flow

1. Guest visits `https://gast.grandhotellysekil.se/`
2. Enters booking number (e.g. `12345`)
3. Client POSTs `{ booking_number: "12345" }` to `/api/lookup`
4. API queries: `SELECT guest_token FROM bookings WHERE sirvoy_booking_id = $1`
5. If found: returns `{ token: "abc..." }` → client calls `router.push("/guest/abc...")`
6. If not found: returns 404 `{ error: "Ingen bokning hittades med det numret." }`
7. If rate limited: returns 429

## UI

- Background: `var(--background)` (`#f4f1ec`)
- Centered vertically and horizontally, full viewport height
- Hotel name "Grand Hotel Lysekil" in Cormorant Garamond serif, large
- Subtitle label in small caps: `text-[9.5px] tracking-[0.3em] uppercase text-accent`
- Single text input for booking number, `rounded-[4px]`, styled consistent with existing `form-input` pattern
- Submit button: full-width, `bg-primary text-white rounded-[4px]`
- Loading state: button shows "Söker..." and is disabled during fetch
- Error state: small red-tinted message below input
- No navigation bar — this is a standalone entry page

## Security

- Rate limited: 10 requests/minute per IP (prevents enumeration brute force)
- Only `guest_token` is returned — no booking details exposed at lookup stage
- Expired tokens: not checked at lookup (handled by the existing guest portal when token is used)

## Error Messages (Swedish)

- Not found: `"Ingen bokning hittades med det numret."`
- Rate limited: `"För många försök, vänta en stund."`
- Network/server error: `"Något gick fel, försök igen."`

## Files

- **Replace:** `src/app/page.tsx` — new lookup page (client component)
- **Create:** `src/app/api/lookup/route.ts` — new POST endpoint
