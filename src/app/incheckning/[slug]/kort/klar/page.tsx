// ============================================================
// FIL: src/app/incheckning/[slug]/kort/klar/page.tsx
//
// Gästen landar här efter Stripe. Sidan hämtar sessionen, sparar
// referensen till det sparade kortet och visar rumsnumret —
// incheckningsbekräftelsen låg i sidans tillstånd och försvann när
// gästen skickades vidare till Stripe.
//
// Kräver gruppen kort före rummet (cardBeforeRoom) är det HÄR rummet
// avslöjas första gången, och bara om Stripe bekräftat kortet. Gick
// registreringen inte igenom står rumsnumret ingenstans — då erbjuds
// ett nytt försök, annars får receptionen lösa det.
//
// Serverkomponent: Stripe-nyckeln och gruppdatan stannar på servern.
// ============================================================

import Link from "next/link"
import { notFound } from "next/navigation"
import { getSupabaseServiceClient } from "@/lib/supabase"
import { getGroup, getGroupGuest, floorFromRoom } from "@/lib/group-checkin-data"
import { getStripeClient, isStripeConfigured } from "@/lib/stripe"
import { GrandSwash } from "@/components/GrandLogo"
import { GroupLockup } from "@/components/GroupLockup"
import { RetryCardButton } from "../RetryCardButton"

const labelCls = "text-[9px] tracking-[0.25em] uppercase text-granite font-medium"

/** Hämtar sessionen, sparar kortreferensen och returnerar gästens nyckel. */
async function saveCard(slug: string, sessionId: string) {
  const stripe = getStripeClient()

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["setup_intent.payment_method"],
  })

  // Sessionen måste tillhöra just den här gruppen.
  if (session.metadata?.group_slug !== slug) return null

  const guestKey = session.metadata?.guest_key
  if (!guestKey) return null

  const setupIntent =
    typeof session.setup_intent === "object" && session.setup_intent !== null
      ? session.setup_intent
      : null
  if (!setupIntent || setupIntent.status !== "succeeded") return { guestKey, saved: false }

  const paymentMethod =
    typeof setupIntent.payment_method === "object" && setupIntent.payment_method !== null
      ? setupIntent.payment_method
      : null
  if (!paymentMethod) return { guestKey, saved: false }

  const supabase = getSupabaseServiceClient()
  const { error } = await supabase
    .from("group_checkin_entries")
    .update({
      stripe_payment_method_id: paymentMethod.id,
      card_brand: paymentMethod.card?.brand ?? null,
      card_last4: paymentMethod.card?.last4 ?? null,
    })
    .eq("group_slug", slug)
    .eq("guest_key", guestKey)

  if (error) {
    console.error("[Kort] Kunde inte spara betalmetoden:", error.code)
    return { guestKey, saved: false }
  }

  return { guestKey, saved: true }
}

export default async function CardDonePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ session_id?: string; avbrutet?: string; g?: string }>
}) {
  const { slug } = await params
  const { session_id: sessionId, avbrutet, g } = await searchParams

  const group = getGroup(slug)
  if (!group) notFound()

  // Bakom grinden är rummet fortfarande hemligt när gästen kommer hit.
  const cardGate = Boolean(group.cardBeforeRoom) && isStripeConfigured()

  // Vid avbrott följer gästens nyckel med i adressen, så att ett nytt
  // försök kan startas utan att gästen behöver checka in igen.
  let guestKey: string | null = typeof g === "string" && g ? g : null
  let saved = false
  let failed = false

  if (!avbrutet && sessionId && isStripeConfigured()) {
    try {
      const result = await saveCard(slug, sessionId)
      if (result) {
        guestKey = result.guestKey
        saved = result.saved
        failed = !result.saved
      } else {
        failed = true
      }
    } catch (err) {
      console.error("[Kort] Kunde inte hämta sessionen:", err instanceof Error ? err.message : err)
      failed = true
    }
  }

  const guest = guestKey ? getGroupGuest(group, guestKey) : null

  // Rumsnumret visas bara när kortet är på plats — eller när gruppen
  // inte har någon grind, för då fick gästen rummet redan vid incheckningen.
  const showRoom = guest !== null && (saved || !cardGate)
  const canRetry = cardGate && !saved && guest !== null

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-[340px] text-center reveal-in">
        <div className="mb-6 flex justify-center">
          <GroupLockup company={group.company} logoWidth={150} />
        </div>

        <p className="font-baskerville text-[9px] tracking-[0.3em] uppercase text-muted font-medium mb-3">
          {saved ? "Kort registrerat" : "Minibar"}
        </p>
        <h1 className="font-script text-[38px] text-primary leading-tight mb-6">
          {saved ? "Tack!" : avbrutet ? "Avbrutet" : "Något gick inte fram"}
        </h1>

        {/* Rumsnumret — för grindade grupper är det här första gången det visas */}
        {showRoom && guest && (
          <div className="rounded-[4px] border border-sand bg-white px-6 py-8 shadow-sm">
            <p className={labelCls}>Ditt rum</p>
            <p className="font-serif text-[64px] leading-none text-primary my-3">{guest.room}</p>
            <div className="mx-auto w-8 h-px bg-accent my-4" />
            <p className="text-[13px] text-granite">
              {guest.roomType}
              {floorFromRoom(guest.room) !== null && ` · Våning ${floorFromRoom(guest.room)}`}
            </p>
          </div>
        )}

        <p className="mt-6 text-[12.5px] text-granite leading-relaxed">
          {saved
            ? showRoom
              ? "Ditt kort är sparat som garanti för minibaren. Inget dras om du inte tar något. Gå till receptionen och säg vilket rum du bor i, så får du dina nycklar."
              : "Ditt kort är sparat som garanti för minibaren. Inget dras om du inte tar något. Hämta dina nycklar i receptionen."
            : cardGate
              ? canRetry
                ? "Kortet är inte registrerat, så vi kan inte visa ditt rumsnummer här. Försök igen nedan — eller gå till receptionen, så ordnar vi både kortet och nyckeln där."
                : "Kortet är inte registrerat, så vi kan inte visa ditt rumsnummer här. Gå till receptionen, så ordnar vi både kortet och nyckeln där."
              : avbrutet
                ? "Du avbröt kortregistreringen. Det är helt i sin ordning — säg bara till i receptionen så löser vi minibaren där."
                : "Vi kunde inte bekräfta kortet. Din incheckning är klar ändå — nämn det i receptionen så hjälper vi dig."}
        </p>

        {canRetry && guest && (
          <div className="mt-6 rounded-[4px] border border-sand bg-white px-5 py-5">
            <RetryCardButton
              slug={slug}
              guestKey={guest.key}
              label="Registrera kort och se mitt rum"
            />
            <p className="mt-3 text-[10px] text-granite-light leading-relaxed">
              Kortet hanteras av Stripe och sparas aldrig hos hotellet. Ingen
              debitering sker nu.
            </p>
          </div>
        )}

        {failed && !avbrutet && !cardGate && (
          <p className="mt-4 text-[11px] text-granite-light leading-relaxed">
            Ingen debitering har skett.
          </p>
        )}

        {!canRetry && (
          <div className="mt-8">
            <Link
              href={`/incheckning/${slug}`}
              className="text-[10px] tracking-[0.2em] uppercase text-granite hover:text-primary transition-colors"
            >
              Tillbaka till incheckningen
            </Link>
          </div>
        )}

        <div className="mt-8">
          <GrandSwash gold width={60} className="mx-auto" />
        </div>
      </div>
    </main>
  )
}
