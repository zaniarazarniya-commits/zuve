// ============================================================
// FIL: src/lib/sms.ts
//
// SMS-utskick via 46elks API.
// https://46elks.se/docs/send-sms
// ============================================================

const ELKS_API_USERNAME = process.env.ELKS_API_USERNAME
const ELKS_API_PASSWORD = process.env.ELKS_API_PASSWORD
const FROM_NUMBER = process.env.ELKS_FROM_NUMBER ?? "GrandHotel"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://grandhotellysekil.se"

/**
 * Skicka ett SMS via 46elks.
 * @param phone   Mottagarens telefonnummer (E.164-format, t.ex. +46701234567)
 * @param message SMS-text (max 1600 tecken)
 */
export async function sendSms(phone: string, message: string): Promise<void> {
  if (!ELKS_API_USERNAME || !ELKS_API_PASSWORD) {
    console.warn("[SMS] ELKS_API_USERNAME eller ELKS_API_PASSWORD saknas — SMS skickas inte.")
    return
  }

  // Normalisera telefonnummer: ta bort mellanslag, bindestreck, se till att det börjar med +
  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone) {
    console.warn("[SMS] Ogiltigt telefonnummer, skickar inget:", phone)
    return
  }

  const body = new URLSearchParams({
    from: FROM_NUMBER,
    to: normalizedPhone,
    message,
  })

  try {
    const response = await fetch("https://api.46elks.com/a1/SMS", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${ELKS_API_USERNAME}:${ELKS_API_PASSWORD}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[SMS] 46elks API-fel:", response.status, errorText)
      throw new Error(`46elks API-fel: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log("[SMS] Skickat till", normalizedPhone, "— id:", data.id)
  } catch (err) {
    console.error("[SMS] Kunde inte skicka SMS:", err)
    throw err
  }
}

/**
 * Skicka gästlänk-SMS till en bokning.
 * Används vid ny bokning eller när gästen kompletterat sitt telefonnummer.
 */
export async function sendBookingSms(booking: {
  guest_first_name: string
  guest_phone: string | null
  guest_token: string
  guest_language?: string | null
}): Promise<void> {
  if (!booking.guest_phone) {
    console.log("[SMS] Inget telefonnummer — skickar inget SMS.")
    return
  }

  const name = booking.guest_first_name
  const url = `${APP_URL}/guest/${booking.guest_token}`

  const message =
    booking.guest_language === "en"
      ? `Hi ${name}! Welcome to Grand Hotel Lysekil. See your booking and extras here: ${url}`
      : `Hej ${name}! Välkommen till Grand Hotel Lysekil. Se din bokning och tillval här: ${url}`

  await sendSms(booking.guest_phone, message)
}

/**
 * Normalisera svenskt telefonnummer till E.164-format.
 * T.ex. 070-123 45 67 → +46701234567
 */
function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\.]/g, "")

  if (cleaned.startsWith("+")) {
    return cleaned
  }

  if (cleaned.startsWith("00")) {
    return "+" + cleaned.slice(2)
  }

  if (cleaned.startsWith("0")) {
    return "+46" + cleaned.slice(1)
  }

  // Om det redan är internationellt format utan +
  if (/^\d{10,15}$/.test(cleaned)) {
    return "+" + cleaned
  }

  return null
}
