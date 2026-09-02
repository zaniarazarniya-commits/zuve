// ============================================================
// FIL: src/lib/stay-terms.ts
//
// Villkoren gästen godkänner när kortet registreras vid incheckningen.
//
// Texten ligger i en egen modul utan serverberoenden, så att både
// formuläret och API:et kan använda exakt samma sträng. Den sparas
// ordagrant på incheckningsraden tillsammans med tidpunkten, så att
// ni i efterhand kan visa vad gästen faktiskt godkände.
//
// ⚠️ Ändrar du texten: höj STAY_TERMS_VERSION. Gamla rader behåller
// sin egen text och ska inte skrivas om i efterhand.
// ============================================================

export const STAY_TERMS_VERSION = "2026-09-02"

export const STAY_TERMS_TEXT =
  "Genom att registrera mitt betalkort godkänner jag Grand Hotel Lysekils " +
  "ordningsregler och villkor. Kortet får debiteras för minibar, restaurang- " +
  "och rumsnotor, skador, rökning samt andra kostnader under vistelsen. " +
  "Kortuppgifterna lagras säkert hos vår betalningsleverantör Stripe."
