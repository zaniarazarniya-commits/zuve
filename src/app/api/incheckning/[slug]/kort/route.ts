// ============================================================
// FIL: src/app/api/incheckning/[slug]/kort/route.ts
//
// POST — startar registrering av ett kort för minibaren.
//
// Skapar en Stripe-kund för gästen och en Checkout-session i
// setup-läge, alltså ett sparat kort utan att något debiteras nu.
// Svaret är en adress hos Stripe dit gästen skickas vidare.
//
// Kortuppgifter passerar aldrig den här servern.
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { getGroup, getGroupGuest } from "@/lib/group-checkin-data"
import { getStripeClient, isStripeConfigured } from "@/lib/stripe"
import { MINIBAR_MANDATE_TEXT, MINIBAR_MANDATE_VERSION } from "@/lib/minibar-mandate"

const CARD_RATE_LIMIT = { intervalMs: 60_000, maxRequests: 10 }

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const limit = rateLimit(`kort:${getClientIp(request)}`, CARD_RATE_LIMIT)
  if (!limit.success) {
    return NextResponse.json({ error: "För många försök, vänta en stund." }, { status: 429 })
  }

  const group = getGroup(slug)
  if (!group) {
    return NextResponse.json({ error: "Okänd incheckningslänk." }, { status: 404 })
  }

  // Saknas nyckeln är kortregistrering avstängd, inte trasig.
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Kortregistrering är inte påslagen just nu." },
      { status: 503 }
    )
  }

  let body: { guest_key?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 })
  }

  const guestKey = typeof body.guest_key === "string" ? body.guest_key : ""
  const guest = guestKey ? getGroupGuest(group, guestKey) : null
  if (!guest) {
    return NextResponse.json({ error: "Okänd gäst." }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()

  // Gästen måste ha checkat in först — det är där namn, e-post och
  // telefon kommer ifrån, och det är den raden kortet kopplas till.
  const { data: entry, error: entryError } = await supabase
    .from("group_checkin_entries")
    .select("id, guest_name, email, phone, company_role, stripe_customer_id")
    .eq("group_slug", slug)
    .eq("guest_key", guest.key)
    .single()

  if (entryError || !entry) {
    return NextResponse.json(
      { error: "Checka in först, sedan kan du registrera kortet." },
      { status: 404 }
    )
  }

  const stripe = getStripeClient()

  try {
    // Återanvänd kunden om gästen redan påbörjat en registrering,
    // så att ett byte av kort inte lämnar dubbletter i Stripe.
    const customerId =
      entry.stripe_customer_id ??
      (
        await stripe.customers.create({
          name: entry.guest_name,
          email: entry.email,
          phone: entry.phone,
          metadata: {
            group_slug: slug,
            guest_key: guest.key,
            room: guest.room,
            company_role: entry.company_role ?? "",
            hotel_note: "Minibar — gruppincheckning",
          },
        })
      ).id

    // Adressen byggs från anropet, så flödet stannar på samma domän
    // som gästen redan är på.
    const origin = new URL(request.url).origin

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: customerId,
      // usage: off_session gör att 3D Secure sker nu, medan gästen är
      // närvarande, i stället för att fälla debiteringen efter utcheckning.
      setup_intent_data: {
        metadata: {
          group_slug: slug,
          guest_key: guest.key,
          room: guest.room,
        },
      },
      metadata: {
        group_slug: slug,
        guest_key: guest.key,
      },
      success_url: `${origin}/incheckning/${slug}/kort/klar?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/incheckning/${slug}/kort/klar?avbrutet=1`,
    })

    if (!session.url) {
      console.error("[Kort] Checkout-sessionen saknar url")
      return NextResponse.json({ error: "Något gick fel, försök igen." }, { status: 500 })
    }

    // Godkännandet sker när gästen trycker på knappen — texten står
    // direkt ovanför den. Spara ordagrant vad som visades.
    const { error: updateError } = await supabase
      .from("group_checkin_entries")
      .update({
        stripe_customer_id: customerId,
        card_mandate_accepted_at: new Date().toISOString(),
        card_mandate_text: MINIBAR_MANDATE_TEXT,
        card_mandate_version: MINIBAR_MANDATE_VERSION,
      })
      .eq("id", entry.id)

    if (updateError) {
      console.error("[Kort] Kunde inte spara kundreferensen:", updateError.code)
      return NextResponse.json({ error: "Något gick fel, försök igen." }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[Kort] Stripe-fel:", err instanceof Error ? err.message : "okänt fel")
    return NextResponse.json(
      { error: "Kunde inte starta kortregistreringen. Vänd dig till receptionen." },
      { status: 502 }
    )
  }
}
