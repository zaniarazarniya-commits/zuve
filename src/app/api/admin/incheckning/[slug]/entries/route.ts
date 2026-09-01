// ============================================================
// FIL: src/app/api/admin/incheckning/[slug]/entries/route.ts
//
// GET    — receptionens vy: vilka som checkat in och vilka som saknas.
// DELETE — frigör ett namn som checkats in av misstag.
//
// Till skillnad från den publika routen returnerar den här både
// rumsnummer och kontaktuppgifter. Den är avsedd för personalen.
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { getGroup, floorFromRoom } from "@/lib/group-checkin-data"

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
    .select("id, guest_key, guest_name, room_number, company_role, email, phone, allergies, second_night, created_at")
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
    },
    entries,
    pending,
  })
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
