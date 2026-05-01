// ============================================================
// FIL: src/app/api/extras/route.ts
//
// POST /api/extras
// Sparar ett tillval (extra) kopplat till en bokning.
// Body: { token, extra_id, title, description, price, currency }
// ============================================================

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendExtraAddedNotification } from "@/lib/email"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
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
  const supabase = getSupabase()

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, guest_first_name, guest_last_name")
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
  sendExtraAddedNotification({
    guestName: `${booking.guest_first_name} ${booking.guest_last_name}`,
    extraTitle: title,
    price,
    currency: currency ?? "SEK",
    bookingId: booking.id,
  }).catch((err) => {
    console.error("[Extras] Kunde inte skicka e-postnotis:", err)
  })

  return NextResponse.json(
    { message: "Tillval sparat", extra },
    { status: 201 }
  )
}
