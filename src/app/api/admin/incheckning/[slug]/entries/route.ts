// ============================================================
// FIL: src/app/api/admin/incheckning/[slug]/entries/route.ts
//
// GET    — receptionens vy: vilka som checkat in och vilka som saknas.
// POST   — receptionen checkar in en gäst som kom fram till disken.
// DELETE — frigör ett namn som checkats in av misstag.
//
// Till skillnad från den publika routen returnerar den här både
// rumsnummer och kontaktuppgifter. Den är avsedd för personalen.
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { getGroup, getGroupGuest, floorFromRoom } from "@/lib/group-checkin-data"
import { isValidEmail, normalizeAndValidatePhone, sanitizeNotes } from "@/lib/validation"

/** Postgres felkod för brott mot unique-villkor. */
const UNIQUE_VIOLATION = "23505"

// ============================================================
// GET
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const group = getGroup(slug)
  if (!group) {
    return NextResponse.json({ error: "Okänd grupp." }, { status: 404 })
  }

  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase
    .from("group_checkin_entries")
    .select("id, guest_key, guest_name, room_number, company_role, email, phone, allergies, second_night, staff_note, stripe_customer_id, card_brand, card_last4, created_at")
    .eq("group_slug", slug)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[Incheckning admin] Kunde inte hämta incheckningar:", error.code)
    return NextResponse.json({ error: "Kunde inte hämta data." }, { status: 500 })
  }

  const entries = data ?? []
  const checkedIn = new Set(entries.map((e) => e.guest_key))

  const pending = group.guests
    .filter((g) => !checkedIn.has(g.key))
    .map((g) => ({
      key: g.key,
      name: g.name,
      room: g.room,
      roomType: g.roomType,
      floor: floorFromRoom(g.room),
    }))

  return NextResponse.json({
    group: {
      slug: group.slug,
      company: group.company,
      bookingId: group.bookingId,
      checkIn: group.checkIn,
      checkOut: group.checkOut,
      total: group.guests.length,
      // Styr om den manuella incheckningen frågar om natt två.
      asksSecondNight: Boolean(group.secondNight),
    },
    entries,
    pending,
  })
}

// ============================================================
// POST — receptionen checkar in en gäst manuellt
//
// Alla kommer inte via QR-koden. Den som står i disken checkas in
// härifrån, med det receptionen råkar ha: e-post och telefon är
// frivilliga, och anteckningen bär det som annars hade fastnat på
// en lapp — oftast att minibaren faktureras i stället för att
// gästen lämnat kort.
// ============================================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const group = getGroup(slug)
  if (!group) {
    return NextResponse.json({ error: "Okänd grupp." }, { status: 404 })
  }

  let body: {
    guest_key?: unknown
    email?: unknown
    phone?: unknown
    company_role?: unknown
    second_night?: unknown
    staff_note?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 })
  }

  const guestKey = typeof body.guest_key === "string" ? body.guest_key : ""
  const guest = guestKey ? getGroupGuest(group, guestKey) : null
  if (!guest) {
    return NextResponse.json({ error: "Välj vem det gäller." }, { status: 400 })
  }

  // Frivilligt, men felstavat får det inte bli — e-posten är enda
  // vägen tillbaka till gästen efteråt.
  let email: string | null = null
  if (typeof body.email === "string" && body.email.trim() !== "") {
    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: "Ange en giltig e-postadress." }, { status: 400 })
    }
    email = body.email.trim().toLowerCase()
  }

  let phone: string | null = null
  if (typeof body.phone === "string" && body.phone.trim() !== "") {
    phone = normalizeAndValidatePhone(body.phone)
    if (!phone) {
      return NextResponse.json({ error: "Ange ett giltigt telefonnummer." }, { status: 400 })
    }
  }

  const secondNight =
    typeof body.second_night === "boolean" ? body.second_night : null

  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from("group_checkin_entries").insert({
    group_slug: slug,
    guest_key: guest.key,
    guest_name: guest.name,
    room_number: guest.room,
    company_role: sanitizeNotes(body.company_role) ?? group.company,
    email,
    phone,
    second_night: secondNight,
    staff_note: sanitizeNotes(body.staff_note),
  })

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return NextResponse.json(
        { error: "Den här personen är redan incheckad." },
        { status: 409 }
      )
    }
    console.error("[Incheckning admin] Kunde inte checka in manuellt:", error.code)
    return NextResponse.json({ error: "Kunde inte spara incheckningen." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, room: guest.room, roomType: guest.roomType })
}

// ============================================================
// DELETE — frigör ett namn (?id=<uuid>)
//
// Behövs när någon råkat checka in på fel namn: personen som
// verkligen heter så är annars utelåst, eftersom varje namn bara
// kan checkas in en gång.
// ============================================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const group = getGroup(slug)
  if (!group) {
    return NextResponse.json({ error: "Okänd grupp." }, { status: 404 })
  }

  const id = new URL(request.url).searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Ingen rad angiven." }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()
  const { error } = await supabase
    .from("group_checkin_entries")
    .delete()
    .eq("id", id)
    .eq("group_slug", slug)

  if (error) {
    console.error("[Incheckning admin] Kunde inte ta bort incheckning:", error.code)
    return NextResponse.json({ error: "Kunde inte ta bort raden." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
