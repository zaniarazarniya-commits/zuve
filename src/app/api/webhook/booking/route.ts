// ============================================================
// FIL: src/app/api/webhook/booking/route.ts
//
// Tar emot webhooks från Sirvoy och sparar bokningar i Supabase.
// Hanterar tre Sirvoy-events: "new", "modified" och avbokningar.
// Efter sparande: skickar SMS automatiskt om telefon finns.
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { sendBookingSms } from "@/lib/sms"
import { sendGuestWelcomeEmail, sendManualDeliveryNotification } from "@/lib/email"

const WEBHOOK_RATE_LIMIT = { intervalMs: 60_000, maxRequests: 10 }

function getTokenExpiry(checkOutDate: string): string {
  const date = new Date(checkOutDate)
  date.setDate(date.getDate() + 7)
  return date.toISOString()
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
  bookingDate: string
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
// Hjälpfunktion: detekterar OTA-proxy-e-post (Expedia, Booking.com, etc.)
// ============================================================
function isOtaProxyEmail(email: string): boolean {
  const lower = email.toLowerCase()
  return (
    lower.endsWith("@m.expediapartnercentral.com") ||
    lower.endsWith("@guest.booking.com") ||
    lower.endsWith("@reservations.booking.com") ||
    lower.endsWith("@hotels.com") ||
    lower.endsWith("@agoda.com") ||
    lower.endsWith("@partners.airbnb.com") ||
    lower.endsWith("@trip.com") ||
    lower.endsWith("@travelport.com") ||
    lower.endsWith("@privaterelay.appleid.com")
  )
}

// ============================================================
// POST — anropas av Sirvoy vid ny bokning, ändring eller avbokning.
// ============================================================
export async function POST(request: Request) {
  // Rate limiting
  const clientIp = getClientIp(request)
  const limit = rateLimit(`webhook:${clientIp}`, WEBHOOK_RATE_LIMIT)
  if (!limit.success) {
    return NextResponse.json({ error: "För många anrop" }, { status: 429 })
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
  const supabase = getSupabaseServiceClient()

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
        token_expires_at: getTokenExpiry(body.departureDate),
      },
      { onConflict: "external_booking_id" }
    )
    .select("id, guest_first_name, guest_email, guest_phone, guest_token, guest_language, sms_sent_at, sms_opt_out, email_opt_out")

  if (error) {
    console.error("Supabase-fel:", error)
    return NextResponse.json({ error: "Kunde inte spara bokningen" }, { status: 500 })
  }

  const booking = data?.[0]

  // --- Skicka välkomstmeddelande ENDAST vid nya bokningar ---
  // ENDAST för bokningar från och med 2026-05-01 (inte äldre bokningar som redan finns i systemet)
  const bookingDate = body.bookingDate ? new Date(body.bookingDate) : null
  const cutoffDate = new Date("2026-05-01T00:00:00Z")
  const isNewBooking = bookingDate && bookingDate >= cutoffDate

  const commDisabled = process.env.DISABLE_COMMUNICATION === "true"
  if (commDisabled) {
    console.log("[Webhook] Kommunikation är pausad (DISABLE_COMMUNICATION=true). Inget välkomstmeddelande skickat.")
  } else if (booking && body.event === "new" && !booking.sms_sent_at && isNewBooking) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://gast.grandhotellysekil.se"
    const guestUrl = `${appUrl}/guest/${booking.guest_token}`

    // 1. Försök SMS först
    if (booking.guest_phone) {
      try {
        await sendBookingSms({
          guest_first_name: booking.guest_first_name,
          guest_phone: booking.guest_phone,
          guest_token: booking.guest_token,
          guest_language: booking.guest_language,
          sms_opt_out: booking.sms_opt_out,
        })
        await supabase
          .from("bookings")
          .update({ sms_sent_at: new Date().toISOString() })
          .eq("id", booking.id)
        console.log("[Webhook] SMS skickat för bokning:", booking.id)
      } catch (err) {
        console.error("[Webhook] Kunde inte skicka SMS:", err)
      }
    }
    // 2. Om ingen telefon men riktig e-post finns → skicka välkomstmejl
    else if (booking.guest_email && !isOtaProxyEmail(booking.guest_email) && !booking.email_opt_out) {
      try {
        await sendGuestWelcomeEmail({
          to: booking.guest_email,
          firstName: booking.guest_first_name,
          url: guestUrl,
          language: booking.guest_language,
        })
        await supabase
          .from("bookings")
          .update({ sms_sent_at: new Date().toISOString() })
          .eq("id", booking.id)
        console.log("[Webhook] Välkomstmejl skickat för bokning:", booking.id)
      } catch (err) {
        console.error("[Webhook] Kunde inte skicka välkomstmejl:", err)
      }
    }
    // 3. Proxy-/skyddad e-post → kan ej leverera automatiskt, notifiera receptionen
    else if (booking.guest_email && isOtaProxyEmail(booking.guest_email)) {
      console.log(`[Webhook] Proxy-e-post upptäckt (${booking.guest_email}) — skickar intern notis om manuell leverans.`)
      try {
        await sendManualDeliveryNotification({
          guestName: booking.guest_first_name,
          bookingId: body.bookingId.toString(),
          guestUrl,
          reason: "proxy_email",
          proxyEmail: booking.guest_email,
        })
      } catch (err) {
        console.error("[Webhook] Kunde inte skicka intern notis (proxy):", err)
      }
    }
    // 4. Ingen kontaktinfo alls → notifiera receptionen
    else {
      console.log("[Webhook] Ingen telefon eller e-post — skickar intern notis om manuell leverans.")
      try {
        await sendManualDeliveryNotification({
          guestName: booking.guest_first_name,
          bookingId: body.bookingId.toString(),
          guestUrl,
          reason: "no_contact",
        })
      } catch (err) {
        console.error("[Webhook] Kunde inte skicka intern notis (ingen kontaktinfo):", err)
      }
    }
  } else if (booking && body.event === "new" && !isNewBooking) {
    console.log(`[Webhook] Bokningen är från ${body.bookingDate} — äldre än 2026-05-01. Välkomstmeddelande skickas ej.`)
  } else if (booking) {
    console.log(`[Webhook] Event är "${body.event}" eller välkomst redan skickat.`)
  }

  return NextResponse.json(
    { message: "Bokning mottagen och sparad!", booking },
    { status: 201 }
  )
}
