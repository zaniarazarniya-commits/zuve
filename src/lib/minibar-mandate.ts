// ============================================================
// FIL: src/lib/minibar-mandate.ts
//
// Villkoren gästen godkänner när kortet sparas för minibaren.
//
// Texten ligger i en egen modul utan serverberoenden, så att både
// formuläret och API:et kan använda exakt samma sträng. Den sparas
// ordagrant på incheckningsraden tillsammans med tidpunkten, så att
// ni i efterhand kan visa vad gästen faktiskt godkände.
//
// ⚠️ Ändrar du texten: höj MINIBAR_MANDATE_VERSION. Gamla rader
// behåller sin egen text och ska inte skrivas om i efterhand.
// ============================================================

export const MINIBAR_MANDATE_VERSION = "2026-09-01"

export const MINIBAR_MANDATE_TEXT =
  "Jag godkänner att Grand Hotel Lysekil sparar mitt kort och debiterar det " +
  "för det jag tar ur minibaren på rummet under min vistelse. Beloppet " +
  "motsvarar hotellets prislista för minibaren och dras efter utcheckning. " +
  "Inget dras om jag inte tagit något. Kortuppgifterna hanteras av Stripe och " +
  "lagras aldrig hos hotellet."
