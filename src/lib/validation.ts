// ============================================================
// FIL: src/lib/validation.ts
//
// Server-side valideringsfunktioner för gäst-API:et.
// ============================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validerar en e-postadress.
 */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false
  if (email.length > 254) return false
  return EMAIL_REGEX.test(email)
}

/**
 * Validerar och normaliserar ett telefonnummer till E.164-format.
 * Returnerar det normaliserade numret eller null om ogiltigt.
 */
export function normalizeAndValidatePhone(phone: unknown): string | null {
  if (typeof phone !== "string") return null
  if (phone.length > 50) return null

  const cleaned = phone.replace(/[\s\-\.]/g, "")

  let normalized: string
  if (cleaned.startsWith("+")) {
    normalized = cleaned
  } else if (cleaned.startsWith("00")) {
    normalized = "+" + cleaned.slice(2)
  } else if (cleaned.startsWith("0")) {
    normalized = "+46" + cleaned.slice(1)
  } else if (/^\d{10,15}$/.test(cleaned)) {
    normalized = "+" + cleaned
  } else {
    return null
  }

  // E.164: max 15 siffror efter +
  const digitsOnly = normalized.slice(1)
  if (digitsOnly.length < 8 || digitsOnly.length > 15) return null

  return normalized
}

/**
 * Validerar ETA (beräknad ankomsttid).
 * Tillåter endast formatet HH:00 där HH är 12-23.
 */
export function isValidEta(eta: unknown): eta is string {
  if (typeof eta !== "string") return false
  return /^1[2-9]:00$|^2[0-3]:00$/.test(eta)
}

/**
 * Saniterar en textnotering.
 */
export function sanitizeNotes(notes: unknown): string | null {
  if (typeof notes !== "string") return null
  const trimmed = notes.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > 2000) return trimmed.slice(0, 2000)
  return trimmed
}
