// ============================================================
// FIL: src/app/api/admin/incheckning/[slug]/export/route.ts
//
// Excel-export av gruppens incheckning. Innehåller alla i gruppen,
// även de som ännu inte checkat in, så att listan kan användas som
// underlag i receptionen.
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { getGroup } from "@/lib/group-checkin-data"
import * as XLSX from "xlsx"

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
    .select("guest_key, company_role, email, phone, allergies, created_at")
    .eq("group_slug", slug)

  if (error) {
    console.error("[Incheckning export] Kunde inte hämta data:", error.code)
    return NextResponse.json({ error: "Kunde inte hämta data." }, { status: 500 })
  }

  const byKey = new Map((data ?? []).map((e) => [e.guest_key, e]))

  // Sortera på rumsnummer så att listan följer husets ordning.
  const rows = [...group.guests]
    .sort((a, b) => a.room.localeCompare(b.room, "sv", { numeric: true }))
    .map((g) => {
      const entry = byKey.get(g.key)
      return {
        Rum: g.room,
        Rumstyp: g.roomType,
        Namn: g.name,
        "Företag / Position": entry?.company_role ?? "",
        "E-post": entry?.email ?? "",
        Telefon: entry?.phone ?? "",
        "Allergier / specialkost": entry?.allergies ?? "",
        Incheckad: entry ? "Ja" : "Nej",
        Tidpunkt: entry ? new Date(entry.created_at).toLocaleString("sv-SE") : "",
      }
    })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Incheckning")

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  const filename = `incheckning_${group.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}_${group.checkIn}.xlsx`

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
