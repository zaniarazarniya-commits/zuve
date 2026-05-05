// ============================================================
// FIL: src/app/api/guest/[token]/delete/route.ts
//
// DELETE — låter gästen begära radering av sina personuppgifter.
// Ersätter namn/e-post/telefon/notes med NULL eller [RADERAD].
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const DELETE_RATE_LIMIT = { intervalMs: 60_000, maxRequests: 5 }

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.json({ error: "Ingen token angiven" }, { status: 400 })
  }

  const clientIp = getClientIp(request)
  const limit = rateLimit(`delete:${clientIp}`, DELETE_RATE_LIMIT)
  if (!limit.success) {
    return NextResponse.json({ error: "För många anrop" }, { status: 429 })
  }

  const supabase = getSupabaseServiceClient()

  // Verifiera att bokningen finns
  const { data: existing, error: lookupError } = await supabase
    .from("bookings")
    .select("id")
    .eq("guest_token", token)
    .single()

  if (lookupError || !existing) {
    return NextResponse.json({ error: "Bokningen hittades inte" }, { status: 404 })
  }

  // Pseudonymisera/radera personuppgifter
  const { error } = await supabase
    .from("bookings")
    .update({
      guest_first_name: "[RADERAD]",
      guest_last_name: "[RADERAD]",
      guest_email: null,
      guest_phone: null,
      notes: null,
      personal_data_purged_at: new Date().toISOString(),
    })
    .eq("id", existing.id)

  if (error) {
    console.error("[Delete] Kunde inte radera personuppgifter:", error)
    return NextResponse.json({ error: "Kunde inte radera uppgifterna" }, { status: 500 })
  }

  console.log("[Delete] Personuppgifter raderade för bokning:", existing.id)
  return NextResponse.json({ message: "Dina personuppgifter har raderats." })
}
