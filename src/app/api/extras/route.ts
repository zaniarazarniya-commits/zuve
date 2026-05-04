// ============================================================
// FIL: src/app/api/extras/route.ts
//
// POST /api/extras
// Sparar ett tillval (extra) kopplat till en bokning.
// Body: { token, extra_id, title, description, price, currency }
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { sendExtraAddedNotification, sendGuestExtraConfirmation } from "@/lib/email"

const EXTRAS_RATE_LIMIT = { intervalMs: 60_000, maxRequests: 10 }

export async function POST(request: Request) {
  // Rate limiting per IP
  const clientIp = getClientIp(request)
  const limit = rateLimit(`extras:${clientIp}`, EXTRAS_RATE_LIMIT)
  if (!limit.success) {
    return NextResponse.json({ error: "För många anrop" }, { status: 429 })
  }

  let body: {
    token: string
    extra_id: string
    title: string
    description?: string
    price: number
    currency?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 })
  }

  const { token, extra_id, title, description, price, currency } = body

  if (!token || !extra_id || !title || price == null) {
    return NextResponse.json(
      { error: "Saknade obligatoriska fält: token, extra_id, title, price" },
      { status: 400 }
    )
  }

  // --- Hämta bokningen via token ---
  const supabase = getSupabaseServiceClient()

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, guest_first_name, guest_last_name, sirvoy_booking_id, guest_email")
    .eq("guest_token", token)
    .single()

  if (bookingError || !booking) {
    console.error("[Extras] Bokning hittades inte:", bookingError)
    return NextResponse.json(
      { error: "Bokningen hittades inte" },
      { status: 404 }
    )
  }

  // --- Spara tillvalet ---
  const { data: extra, error: extraError } = await supabase
    .from("booking_extras")
    .insert({
      booking_id: booking.id,
      extra_id,
      title,
      description: description ?? null,
      price,
      currency: currency ?? "SEK",
      quantity: 1,
      status: "requested",
    })
    .select()
    .single()

  if (extraError) {
    console.error("[Extras] Kunde inte spara tillval:", extraError)
    return NextResponse.json(
      { error: "Kunde inte spara tillvalet" },
      { status: 500 }
    )
  }

  // --- Skicka e-postnotis till hotellet (fire-and-forget) ---
  const commDisabled = process.env.DISABLE_COMMUNICATION === "true"
  if (commDisabled) {
    console.log("[Extras] Kommunikation är pausad (DISABLE_COMMUNICATION=true) — e-postnotis skickas inte.")
    return NextResponse.json(
      { message: "Tillval sparat (kommunikation pausad)", extra },
      { status: 201 }
    )
  }

  console.log("[Extras] Försöker skicka tillvalsnotis:", {
    extra: title,
    booking: booking.sirvoy_booking_id ?? booking.id,
    smtp: process.env.SMTP_HOST ? "konfigurerad" : "SAKNAS",
  })
  sendExtraAddedNotification({
    guestName: `${booking.guest_first_name} ${booking.guest_last_name}`,
    extraTitle: title,
    price,
    currency: currency ?? "SEK",
    bookingId: booking.sirvoy_booking_id ?? booking.id,
  })
    .then(() => console.log("[Extras] Tillvalsnotis skickad!"))
    .catch((err) => {
      console.error("[Extras] Kunde inte skicka e-postnotis:", err)
    })

  // Gästbekräftelse (fire-and-forget) om e-post finns
  if (booking.guest_email) {
    sendGuestExtraConfirmation({
      guestName: `${booking.guest_first_name} ${booking.guest_last_name}`,
      guestEmail: booking.guest_email,
      extraTitle: title,
      price,
      currency: currency ?? "SEK",
    }).catch((err) => {
      console.error("[Extras] Kunde inte skicka gästbekräftelse:", err);
    });
  }

  return NextResponse.json(
    { message: "Tillval sparat", extra },
    { status: 201 }
  )
}
