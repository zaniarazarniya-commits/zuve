// ============================================================
// FIL: src/app/api/guest/[token]/route.ts
//
// GET  — hämtar bokningsdata för en gäst-token.
// PATCH — låter gästen komplettera sina uppgifter.
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { isValidEmail, normalizeAndValidatePhone, isValidEta, sanitizeNotes } from "@/lib/validation"
import { sendCompletionSms } from "@/lib/sms"
import { sendGuestUpdatedNotification } from "@/lib/email"

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "(saknas)"
  if (phone.length < 6) return "***"
  return phone.slice(0, 3) + "****" + phone.slice(-2)
}

const GUEST_RATE_LIMIT = { intervalMs: 60_000, maxRequests: 30 }

function isTokenExpired(tokenExpiresAt: string | null | undefined): boolean {
  if (!tokenExpiresAt) return false
  return new Date(tokenExpiresAt) < new Date()
}

// ============================================================
// GET
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.json(
      { error: "Ingen token angiven" },
      { status: 400 }
    )
  }

  // Rate limiting per IP
  const clientIp = getClientIp(request)
  const limit = rateLimit(`guest:${clientIp}`, GUEST_RATE_LIMIT)
  if (!limit.success) {
    return NextResponse.json({ error: "För många anrop" }, { status: 429 })
  }

  const supabase = getSupabaseServiceClient()

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
      cancelled,
      notes,
      guest_language,
      total_price_sek,
      currency,
      sirvoy_booking_id,
      sirvoy_room_name,
      sirvoy_room_type,
      token_expires_at,
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

    console.error("[Guest API] Databasfel vid gästuppslag, kod:", error.code)
    return NextResponse.json(
      { error: "Något gick fel, försök igen." },
      { status: 500 }
    )
  }

  if (isTokenExpired(booking.token_expires_at)) {
    return NextResponse.json(
      { error: "Länken har gått ut. Kontakta receptionen för hjälp." },
      { status: 410 }
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

  if (!token) {
    return NextResponse.json(
      { error: "Ingen token angiven" },
      { status: 400 }
    )
  }

  // Rate limiting per IP
  const clientIp = getClientIp(request)
  const limit = rateLimit(`guest:${clientIp}`, GUEST_RATE_LIMIT)
  if (!limit.success) {
    return NextResponse.json({ error: "För många anrop" }, { status: 429 })
  }

  const supabase = getSupabaseServiceClient()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 })
  }

  // --- Hämta befintlig bokning ---
  const { data: existing, error: lookupError } = await supabase
    .from("bookings")
    .select("guest_phone, guest_first_name, guest_last_name, sirvoy_booking_id, token_expires_at, sms_opt_out")
    .eq("guest_token", token)
    .single()

  if (lookupError || !existing) {
    console.error("[PATCH] Kunde inte hämta befintlig bokning, kod:", lookupError?.code)
    return NextResponse.json(
      { error: "Bokningen hittades inte" },
      { status: 404 }
    )
  }

  if (isTokenExpired((existing as Record<string, unknown>).token_expires_at as string | undefined)) {
    return NextResponse.json(
      { error: "Länken har gått ut. Kontakta receptionen för hjälp." },
      { status: 410 }
    )
  }

  const hadPhoneBefore = Boolean(existing.guest_phone)

  // Kolla om sms_completion_sent_at finns (kan saknas tills migration körts)
  let completionSmsAlreadySent = false
  try {
    const { data: smsCheck } = await supabase
      .from("bookings")
      .select("sms_completion_sent_at")
      .eq("guest_token", token)
      .single()
    if (smsCheck) {
      completionSmsAlreadySent = Boolean((smsCheck as Record<string, unknown>).sms_completion_sent_at)
    }
  } catch {
    // Kolumnen finns inte ännu — behandla som ej skickat
    completionSmsAlreadySent = false
  }

  // Validera och sanitera input
  const updateData: Record<string, unknown> = {}

  if ("guest_email" in body) {
    const email = body.guest_email
    if (email !== null && email !== "" && !isValidEmail(email)) {
      return NextResponse.json({ error: "Ogiltig e-postadress" }, { status: 400 })
    }
    updateData.guest_email = email === "" ? null : email
  }

  if ("guest_phone" in body) {
    const phone = body.guest_phone
    if (phone !== null && phone !== "") {
      const normalized = normalizeAndValidatePhone(phone)
      if (!normalized) {
        return NextResponse.json({ error: "Ogiltigt telefonnummer" }, { status: 400 })
      }
      updateData.guest_phone = normalized
    } else {
      updateData.guest_phone = null
    }
  }

  if ("eta" in body) {
    const eta = body.eta
    if (eta !== null && eta !== "" && !isValidEta(eta)) {
      return NextResponse.json({ error: "Ogiltig ankomsttid" }, { status: 400 })
    }
    updateData.eta = eta === "" ? null : eta
  }

  if ("notes" in body) {
    updateData.notes = sanitizeNotes(body.notes)
  }

  if ("sms_opt_out" in body) {
    updateData.sms_opt_out = body.sms_opt_out === true
  }

  if ("email_opt_out" in body) {
    updateData.email_opt_out = body.email_opt_out === true
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
      sirvoy_booking_id,
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
  // Oavsett om e-post redan skickats — gästen ska få mobillänk när de kompletterar
  const hasPhoneNow = Boolean(booking.guest_phone)
  const commDisabled = process.env.DISABLE_COMMUNICATION === "true"

  if (commDisabled) {
    console.log("[PATCH] Kommunikation är pausad (DISABLE_COMMUNICATION=true).")
  } else if (!hadPhoneBefore && hasPhoneNow && !completionSmsAlreadySent) {
    console.log("[PATCH] Försöker skicka completion-SMS till:", maskPhone(booking.guest_phone))
    try {
      await sendCompletionSms({
        guest_first_name: booking.guest_first_name,
        guest_phone: booking.guest_phone,
        guest_token: token,
        guest_language: booking.guest_language,
      })
      // Markera att completion-SMS skickats så det inte skickas igen
      try {
        await supabase
          .from("bookings")
          .update({ sms_completion_sent_at: new Date().toISOString() })
          .eq("id", booking.id)
        console.log("[PATCH] Completion-SMS skickat och markerat")
      } catch {
        console.log("[PATCH] Kunde inte markera sms_completion_sent_at (kolumn saknas?) — SMS skickades dock.")
      }
    } catch (err) {
      console.error("[PATCH] Kunde inte skicka SMS:", err)
    }
  } else {
    console.log("[PATCH] SMS skickas INTE. Orsak:",
      hadPhoneBefore ? "hade redan telefon" :
      completionSmsAlreadySent ? "completion-SMS redan skickat" :
      "har fortfarande ingen telefon"
    )
  }

  // --- Skicka admin-notifikation om komplettering ---
  try {
    console.log("[PATCH] Försöker skicka e-postnotis...")
    await sendGuestUpdatedNotification({
      guestName: `${booking.guest_first_name} ${booking.guest_last_name}`,
      phone: booking.guest_phone,
      eta: booking.eta,
      notes: booking.notes,
      bookingId: booking.sirvoy_booking_id ?? booking.id,
    })
    console.log("[PATCH] E-postnotis skickad")
  } catch (err) {
    console.error("[PATCH] Kunde inte skicka e-postnotis, bokning:", booking.id)
  }

  return NextResponse.json({ booking })
}
