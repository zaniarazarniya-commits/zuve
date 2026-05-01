// ============================================================
// FIL: src/app/api/guest/[token]/route.ts
//
// GET  — hämtar bokningsdata för en gäst-token.
// PATCH — låter gästen komplettera sina uppgifter.
// ============================================================

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendBookingSms } from "@/lib/sms"
import { sendGuestUpdatedNotification } from "@/lib/email"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================
// GET
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = getSupabase()

  if (!token) {
    return NextResponse.json(
      { error: "Ingen token angiven" },
      { status: 400 }
    )
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id,
      guest_first_name,
      guest_last_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      number_of_guests,
      eta,
      status,
      notes,
      guest_language,
      total_price_sek,
      currency,
      sirvoy_room_name,
      sirvoy_room_type,
      rooms (
        room_number,
        room_type,
        floor
      )
    `)
    .eq("guest_token", token)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Bokningen hittades inte. Länken kan vara felaktig eller utgången." },
        { status: 404 }
      )
    }

    console.error("Databasfel vid gästuppslag:", error)
    return NextResponse.json(
      { error: "Något gick fel, försök igen." },
      { status: 500 }
    )
  }

  return NextResponse.json({ booking })
}

// ============================================================
// PATCH
// ============================================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = getSupabase()

  if (!token) {
    return NextResponse.json(
      { error: "Ingen token angiven" },
      { status: 400 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 })
  }

  // --- Hämta befintlig bokning för att se om telefon saknades ---
  const { data: existing, error: lookupError } = await supabase
    .from("bookings")
    .select("guest_phone, guest_first_name, guest_last_name")
    .eq("guest_token", token)
    .single()

  if (lookupError || !existing) {
    console.error("[PATCH] Kunde inte hämta befintlig bokning:", lookupError)
    return NextResponse.json(
      { error: "Bokningen hittades inte" },
      { status: 404 }
    )
  }

  const hadPhoneBefore = Boolean(existing.guest_phone)

  // Whitelist
  const allowedFields = ["guest_email", "guest_phone", "eta", "notes"]
  const updateData: Record<string, unknown> = {}

  for (const key of allowedFields) {
    if (key in body) {
      updateData[key] = body[key]
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "Inga giltiga fält att uppdatera" },
      { status: 400 }
    )
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("guest_token", token)
    .select(`
      id,
      guest_first_name,
      guest_last_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      number_of_guests,
      eta,
      status,
      notes,
      guest_language,
      total_price_sek,
      currency,
      sirvoy_room_name,
      sirvoy_room_type,
      rooms (
        room_number,
        room_type,
        floor
      )
    `)
    .single()

  if (error) {
    console.error("Databasfel vid uppdatering:", error)
    return NextResponse.json(
      { error: "Kunde inte uppdatera bokningen" },
      { status: 500 }
    )
  }

  // --- Skicka SMS om telefon lagts till för första gången ---
  const hasPhoneNow = Boolean(booking.guest_phone)
  if (!hadPhoneBefore && hasPhoneNow) {
    sendBookingSms({
      guest_first_name: booking.guest_first_name,
      guest_phone: booking.guest_phone,
      guest_token: token,
      guest_language: booking.guest_language,
    }).catch((err) => {
      console.error("[PATCH] Kunde inte skicka SMS:", err)
    })
  }

  // --- Skicka admin-notifikation om komplettering ---
  sendGuestUpdatedNotification({
    guestName: `${booking.guest_first_name} ${booking.guest_last_name}`,
    phone: booking.guest_phone,
    eta: booking.eta,
    notes: booking.notes,
    bookingId: booking.id,
  }).catch((err) => {
    console.error("[PATCH] Kunde inte skicka e-postnotis:", err)
  })

  return NextResponse.json({ booking })
}
