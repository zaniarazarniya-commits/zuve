// ============================================================
// FIL: src/app/api/incheckning/[slug]/route.ts
//
// GET  — hämtar gruppens namnlista (utan rumsnummer).
// POST — gästen checkar in sig själv och får sitt rum tillbaka.
//
// Rumsnumren lämnar aldrig servern i GET-svaret. Ett rum avslöjas
// bara för den som just fyllt i sina uppgifter, i POST-svaret.
// Annars hade vem som helst som skannat QR-koden kunnat läsa av
// vilket rum varje namngiven person bor i.
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { isValidEmail, normalizeAndValidatePhone, sanitizeNotes } from "@/lib/validation"
import {
  getGroup,
  getGroupGuest,
  floorFromRoom,
  guestNeedsFullName,
  isCompleteName,
} from "@/lib/group-checkin-data"
import { isStripeConfigured } from "@/lib/stripe"

const READ_RATE_LIMIT = { intervalMs: 60_000, maxRequests: 60 }
const CHECKIN_RATE_LIMIT = { intervalMs: 60_000, maxRequests: 10 }

/** Postgres felkod för brott mot unique-villkor. */
const UNIQUE_VIOLATION = "23505"

// ============================================================
// GET — namnlista + vilka som redan checkat in
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const limit = rateLimit(`incheckning-get:${getClientIp(request)}`, READ_RATE_LIMIT)
  if (!limit.success) {
    return NextResponse.json({ error: "För många anrop, vänta en stund." }, { status: 429 })
  }

  const group = getGroup(slug)
  if (!group) {
    return NextResponse.json({ error: "Okänd incheckningslänk." }, { status: 404 })
  }

  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase
    .from("group_checkin_entries")
    .select("guest_key")
    .eq("group_slug", slug)

  if (error) {
    console.error("[Incheckning] Kunde inte hämta incheckningar:", error.code)
    return NextResponse.json({ error: "Något gick fel, försök igen." }, { status: 500 })
  }

  const claimed = new Set((data ?? []).map((row) => row.guest_key))

  return NextResponse.json({
    group: {
      company: group.company,
      checkIn: group.checkIn,
      checkOut: group.checkOut,
      note: group.note ?? null,
      welcome: group.welcome ?? null,
      secondNight: group.secondNight ?? null,
      // Kortsteget kräver Stripe. Saknas nyckeln är det omöjligt att
      // genomföra, och då släpps gästen fram till rummet i stället för
      // att fastna i en återvändsgränd.
      cardBeforeRoom: Boolean(group.cardBeforeRoom) && isStripeConfigured(),
    },
    guests: group.guests.map((g) => ({
      key: g.key,
      name: g.name,
      claimed: claimed.has(g.key),
      needsFullName: guestNeedsFullName(g),
    })),
  })
}

// ============================================================
// POST — gästen checkar in sig själv
// ============================================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const limit = rateLimit(`incheckning-post:${getClientIp(request)}`, CHECKIN_RATE_LIMIT)
  if (!limit.success) {
    const retryAfterSecs = Math.ceil((limit.resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: "För många försök, vänta en stund." },
      { status: 429, headers: { "Retry-After": String(retryAfterSecs) } }
    )
  }

  const group = getGroup(slug)
  if (!group) {
    return NextResponse.json({ error: "Okänd incheckningslänk." }, { status: 404 })
  }

  let body: {
    guest_key?: unknown
    full_name?: unknown
    company_role?: unknown
    email?: unknown
    phone?: unknown
    allergies?: unknown
    second_night?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 })
  }

  const guestKey = typeof body.guest_key === "string" ? body.guest_key : ""
  const guest = guestKey ? getGroupGuest(group, guestKey) : null
  if (!guest) {
    return NextResponse.json({ error: "Välj ditt namn i listan." }, { status: 400 })
  }

  // Står bara förnamnet i bokningen måste gästen fylla i hela namnet —
  // receptionen behöver det, och Sirvoy kortar av namnen i vissa bokningar.
  let guestName = guest.name
  if (guestNeedsFullName(guest)) {
    const submitted = sanitizeNotes(body.full_name)
    if (!submitted || !isCompleteName(submitted)) {
      return NextResponse.json(
        { error: "Fyll i ditt för- och efternamn." },
        { status: 400 }
      )
    }
    guestName = submitted.replace(/\s+/g, " ")
  }

  const companyRole = sanitizeNotes(body.company_role)
  if (!companyRole) {
    return NextResponse.json({ error: "Fyll i företag och position." }, { status: 400 })
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: "Ange en giltig e-postadress." }, { status: 400 })
  }
  const email = body.email.trim().toLowerCase()

  const phone = normalizeAndValidatePhone(body.phone)
  if (!phone) {
    return NextResponse.json({ error: "Ange ett giltigt telefonnummer." }, { status: 400 })
  }

  // Frivilligt fält — sanitizeNotes ger null för tom text.
  const allergies = sanitizeNotes(body.allergies)

  // Ställer gruppen frågan om extra natt måste gästen ha valt aktivt.
  // Ett uteblivet svar får inte tolkas som "nej" — då hade receptionen
  // och städet fått fel bild av vilka rum som ska vändas.
  let secondNight: boolean | null = null
  if (group.secondNight) {
    if (typeof body.second_night !== "boolean") {
      return NextResponse.json(
        { error: "Välj om du stannar ytterligare en natt." },
        { status: 400 }
      )
    }
    secondNight = body.second_night
  }

  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from("group_checkin_entries").insert({
    group_slug: slug,
    guest_key: guest.key,
    guest_name: guestName,
    room_number: guest.room,
    company_role: companyRole,
    email,
    phone,
    allergies,
    second_night: secondNight,
  })

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return NextResponse.json(
        { error: "Den här personen är redan incheckad. Fråga i receptionen om det inte var du." },
        { status: 409 }
      )
    }
    console.error("[Incheckning] Kunde inte spara incheckning:", error.code)
    return NextResponse.json({ error: "Något gick fel, försök igen." }, { status: 500 })
  }

  // Kräver gruppen kort före rummet lämnar rumsnumret inte servern här.
  // Det avslöjas först på kvittosidan, efter att Stripe bekräftat kortet —
  // annars hade grinden bara varit kosmetisk och gått att kringgå genom
  // att titta i webbläsarens nätverksflik.
  const cardRequired = Boolean(group.cardBeforeRoom) && isStripeConfigured()
  if (cardRequired) {
    return NextResponse.json({ cardRequired: true, name: guestName })
  }

  return NextResponse.json({
    cardRequired: false,
    name: guestName,
    room: guest.room,
    roomType: guest.roomType,
    floor: floorFromRoom(guest.room),
  })
}
