import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // format: "2026-05"

  const supabase = getSupabaseServiceClient();

  let query = supabase
    .from("contest_entries")
    .select("name, phone, email, address, city, postal_code, created_at")
    .order("created_at", { ascending: false });

  if (month) {
    const start = `${month}-01T00:00:00.000Z`;
    const [y, m] = month.split("-").map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
    const end = `${nextMonth}-01T00:00:00.000Z`;
    query = query.gte("created_at", start).lt("created_at", end);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Kunde inte hämta data." }, { status: 500 });
  }

  const rows = (data ?? []).map((e) => ({
    Namn: e.name,
    Telefon: e.phone,
    "E-post": e.email,
    Adress: e.address,
    Stad: e.city,
    Postnummer: e.postal_code,
    Datum: new Date(e.created_at).toLocaleDateString("sv-SE"),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Anmälningar");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = month ? `tavling_${month}.xlsx` : "tavling_alla.xlsx";

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
