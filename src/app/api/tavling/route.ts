import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, address, city, postal_code } = body;

  if (!name || !phone || !email || !address || !city || !postal_code) {
    return NextResponse.json({ error: "Alla fält är obligatoriska." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("contest_entries").insert({
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    address: address.trim(),
    city: city.trim(),
    postal_code: postal_code.trim(),
  });

  if (error) {
    return NextResponse.json({ error: "Något gick fel, försök igen." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
