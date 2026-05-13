import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, city, visit_reason } = body;

  if (!name || !phone || !email || !city || !visit_reason) {
    return NextResponse.json({ error: "Alla fält är obligatoriska." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("contest_entries").insert({
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    city: city.trim(),
    visit_reason: visit_reason.trim(),
  });

  if (error) {
    return NextResponse.json({ error: "Något gick fel, försök igen." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
