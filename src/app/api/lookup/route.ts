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
