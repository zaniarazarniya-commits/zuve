import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("contest_entries")
    .select("id, name, phone, email, address, city, postal_code, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Kunde inte hämta data." }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
