// ============================================================
// FIL: src/lib/email.ts
//
// E-postutskick via SMTP (Nodemailer).
// Används för admin-notifikationer till hotellet.
// ============================================================

import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@grandhotellysekil.se"

/**
 * Skicka ett e-postmeddelande till admin.
 * @param subject Ämnesrad
 * @param body    Textinnehåll (plain text)
 */
export async function sendAdminNotification(subject: string, body: string): Promise<void> {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("[Email] SMTP-konfiguration saknas — e-post skickas inte.")
    console.warn("[Email] Ämne:", subject)
    return
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: `"Grand Hotel Lysekil" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject,
      text: body,
    })

    console.log("[Email] Skickat:", info.messageId)
  } catch (err) {
    console.error("[Email] Kunde inte skicka e-post:", err)
    throw err
  }
}

// ============================================================
// Färdiga mallar för admin-notifikationer
// ============================================================

/**
 * Notifikation: nytt tillval bokat av gäst.
 */
export async function sendExtraAddedNotification(params: {
  guestName: string
  extraTitle: string
  price: number
  currency: string
  bookingId: string
}): Promise<void> {
  const subject = `Tillvalsintresse: ${params.extraTitle} — ${params.guestName}`
  const body = `
Hej,

En gäst har visat intresse för ett tillval via gästportalen:

Gäst:      ${params.guestName}
Tillval:   ${params.extraTitle}
Pris:      ${params.price} ${params.currency}
Bokning:   ${params.bookingId}

Åtgärd: Kontakta gästen via receptionen för att bekräfta och boka tillvalet.

Med vänlig hälsning,
Grand Hotel Lysekil Gästportal
  `.trim()

  await sendAdminNotification(subject, body)
}

/**
 * Skicka välkomstmejl till gästen (om de ej har telefonnummer).
 */
export async function sendGuestWelcomeEmail(params: {
  to: string
  firstName: string
  url: string
  language?: string | null
}): Promise<void> {
  const subject = params.language === "en"
    ? `Welcome to Grand Hotel Lysekil, ${params.firstName}!`
    : `Välkommen till Grand Hotel Lysekil, ${params.firstName}!`

  const body = params.language === "en"
    ? `
Hi ${params.firstName}!

Welcome to Grand Hotel Lysekil. We are looking forward to your visit.

See your booking and explore extras and experiences here:
${params.url}

If you have any questions, please contact us at 0523-61 10 00.

Warm welcome,
Grand Hotel Lysekil
Kungsgatan 36, 453 33 Lysekil
    `.trim()
    : `
Hej ${params.firstName}!

Välkommen till Grand Hotel Lysekil. Vi ser fram emot ditt besök.

Se din bokning och utforska tillval och upplevelser här:
${params.url}

Har du frågor? Kontakta oss på 0523-61 10 00.

Varmt välkommen,
Grand Hotel Lysekil
Kungsgatan 36, 453 33 Lysekil
    `.trim()

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("[Email] SMTP saknas — välkomstmejl skickas inte.")
    return
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  try {
    const info = await transporter.sendMail({
      from: `"Grand Hotel Lysekil" <${SMTP_USER}>`,
      to: params.to,
      subject,
      text: body,
    })
    console.log("[Email] Välkomstmejl skickat:", info.messageId)
  } catch (err) {
    console.error("[Email] Kunde inte skicka välkomstmejl:", err)
    throw err
  }
}

/**
 * Notifikation: gäst har kompletterat sina uppgifter.
 */
export async function sendGuestUpdatedNotification(params: {
  guestName: string
  phone?: string | null
  eta?: string | null
  notes?: string | null
  bookingId: string
}): Promise<void> {
  const subject = `Komplettering mottagen — ${params.guestName}`
  const body = `
Hej,

En gäst har kompletterat sina uppgifter:

Gäst:    ${params.guestName}
Telefon: ${params.phone ?? "(ej angivet)"}
ETA:     ${params.eta ?? "(ej angivet)"}
Önskemål:${params.notes ? "\n" + params.notes : " (inga)"}
Bokning: ${params.bookingId}

Med vänlig hälsning,
Grand Hotel Lysekil Gästapp
  `.trim()

  await sendAdminNotification(subject, body)
}
