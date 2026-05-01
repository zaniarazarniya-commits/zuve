// ============================================================
// FIL: src/app/api/webhook/booking/route.ts
//
// Tar emot webhooks från Sirvoy och sparar bokningar i Supabase.
// Hanterar tre Sirvoy-events: "new", "modified" och avbokningar.
// Efter sparande: skickar SMS automatiskt om telefon finns.
// ============================================================

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendBookingSms } from "@/lib/sms"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================
// TypeScript-typer som speglar Sirvoys JSON-format exakt.
// ============================================================
interface SirvoyGuest {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  language: string | null
  message: string | null
}

interface SirvoyRoom {
  RoomName: string
  RoomTypeName: string
  RoomId: number
  arrivalDate: string
  departureDate: string
  adults: number
  price: number
  roomTotal: number
}

interface SirvoyWebhook {
  version: string
  event: "new" | "modified" | "deleted"
  propertyId: number
  bookingId: number
  arrivalDate: string
  departureDate: string
  cancelled: boolean
  eta: string | null
  totalAdults: number
  currency: string
  totalPrice: number
  totalPriceIncludingSurcharges: number
  bookingSource: string | null
  bookingIsCheckedIn: boolean
  bookingIsCheckedOut: boolean
  bookingIsConfirmed: boolean
  guest: SirvoyGuest
  rooms: SirvoyRoom[]
}

// ============================================================
// Hjälpfunktion: räknar ut status från Sirvoys flaggor.
// ============================================================
function mapStatus(body: SirvoyWebhook): string {
  if (body.cancelled) return "cancelled"
  if (body.bookingIsCheckedOut) return "checked_out"
  if (body.bookingIsCheckedIn) return "checked_in"
  if (body.bookingIsConfirmed) return "confirmed"
  return "confirmed"
}

// ============================================================
// POST — anropas av Sirvoy vid ny bokning, ändring eller avbokning.
// ============================================================
export async function POST(request: Request) {
  // Valfri webhook-secret-validering (Sirvoy stöder inte alltid custom headers)
  const webhookSecret = request.headers.get("x-webhook-secret")
  const expectedSecret = process.env.SIRVOY_WEBHOOK_SECRET ?? process.env.WEBHOOK_SECRET
  if (expectedSecret && webhookSecret && webhookSecret !== expectedSecret) {
    return NextResponse.json({ error: "Ogiltig webhook-nyckel" }, { status: 401 })
  }

  let body: SirvoyWebhook
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 })
  }

  if (!body.bookingId || !body.arrivalDate || !body.departureDate || !body.guest?.email) {
    return NextResponse.json(
      { error: "Saknade obligatoriska fält: bookingId, arrivalDate, departureDate eller guest.email" },
      { status: 400 }
    )
  }

  const primaryRoom = body.rooms?.[0] ?? null
  const supabase = getSupabase()

  // --- Slå upp room_id från rooms-tabellen ---
  let room_id: string | null = null
  if (primaryRoom?.RoomName) {
    const { data: roomRow } = await supabase
      .from("rooms")
      .select("id")
      .eq("room_number", primaryRoom.RoomName)
      .single()
    if (roomRow) {
      room_id = roomRow.id
    } else {
      console.log(`[Webhook] Rum ${primaryRoom.RoomName} hittades inte i rooms-tabellen.`)
    }
  }

  const { data, error } = await supabase
    .from("bookings")
    .upsert(
      {
        external_booking_id: String(body.bookingId),
        sirvoy_booking_id: String(body.bookingId),
        sirvoy_property_id: String(body.propertyId),

        guest_first_name: body.guest.firstName,
        guest_last_name: body.guest.lastName,
        guest_email: body.guest.email,
        guest_phone: body.guest.phone ?? null,
        guest_language: body.guest.language ?? "sv",
        notes: body.guest.message ?? null,

        check_in_date: body.arrivalDate,
        check_out_date: body.departureDate,
        number_of_guests: body.totalAdults,
        eta: body.eta ?? null,
        booking_source: body.bookingSource ?? null,
        status: mapStatus(body),
        cancelled: body.cancelled,

        total_price_sek: body.totalPriceIncludingSurcharges,
        currency: body.currency,

        sirvoy_room_name: primaryRoom?.RoomName ?? null,
        sirvoy_room_type: primaryRoom?.RoomTypeName ?? null,
        room_id,
      },
      { onConflict: "external_booking_id" }
    )
    .select("id, guest_first_name, guest_phone, guest_token, guest_language, sms_sent_at")

  if (error) {
    console.error("Supabase-fel:", error)
    return NextResponse.json({ error: "Kunde inte spara bokningen" }, { status: 500 })
  }

  const booking = data?.[0]

  // --- Skicka SMS ENDAST vid nya bokningar och ENDAST om nummer finns och ENDAST om inte redan skickat ---
  if (booking && body.event === "new") {
    if (!booking.sms_sent_at && booking.guest_phone) {
      try {
        await sendBookingSms(booking)
        // Markera att SMS är skickat
        await supabase
          .from("bookings")
          .update({ sms_sent_at: new Date().toISOString() })
          .eq("id", booking.id)
        console.log("[Webhook] SMS skickat och markerat för bokning:", booking.id)
      } catch (err) {
        console.error("[Webhook] Kunde inte skicka SMS:", err)
      }
    } else if (booking.sms_sent_at) {
      console.log("[Webhook] SMS redan skickat tidigare — skickar inte igen.")
    } else {
      console.log("[Webhook] Inget telefonnummer — SMS ej skickat.")
    }
  } else if (booking) {
    console.log(`[Webhook] Event är "${body.event}" — skickar inget SMS (endast vid "new").`)
  }

  return NextResponse.json(
    { message: "Bokning mottagen och sparad!", booking },
    { status: 201 }
  )
}
