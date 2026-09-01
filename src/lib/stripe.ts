// ============================================================
// FIL: src/lib/stripe.ts
//
// Server-only Stripe-klient.
//
// ⚠️ Får ALDRIG importeras av en klientkomponent. Den hemliga
// nyckeln ska inte nå webbläsaren, och SDK:n har inget där att göra.
//
// Kortuppgifter passerar aldrig den här servern. Gästen fyller i
// kortet hos Stripe, och vi sparar bara referenser: kundens id,
// betalmetodens id, korttyp och fyra sista siffror.
// ============================================================

import Stripe from "stripe"

const secretKey = process.env.STRIPE_SECRET_KEY

/**
 * Är kortregistrering påslagen i den här miljön?
 *
 * Saknas nyckeln är funktionen avstängd i stället för trasig —
 * incheckningen ska fungera oavsett om Stripe är konfigurerat.
 */
export function isStripeConfigured(): boolean {
  return Boolean(secretKey)
}

export function getStripeClient(): Stripe {
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY är inte satt. Kortregistrering är avstängd.")
  }
  return new Stripe(secretKey)
}
