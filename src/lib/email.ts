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
const COMMUNICATION_DISABLED = process.env.DISABLE_COMMUNICATION === "true"

export async function sendAdminNotification(subject: string, body: string, html?: string): Promise<void> {
  if (COMMUNICATION_DISABLED) {
    console.warn("[Email] Kommunikation är pausad (DISABLE_COMMUNICATION=true) — e-post skickas inte.")
    return
  }
  console.log("[Email] sendAdminNotification anropad:", { subject, to: ADMIN_EMAIL, hasSmtp: !!SMTP_HOST })
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("[Email] SMTP-konfiguration saknas — e-post skickas inte.")
    console.warn("[Email] Ämne:", subject)
    return
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    requireTLS: true,
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
      html: html ?? body.replace(/\n/g, "<br>"),
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

  const html = `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#faf9f6;">
    <p style="text-align:center;font-size:11px;letter-spacing:0.15em;color:#8c7c6c;text-transform:uppercase;margin-bottom:8px;">Grand Hotel Lysekil</p>
    <h1 style="font-weight:300;font-size:22px;text-align:center;margin:0 0 24px;">Nytt tillvalsintresse</h1>
    <hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;">
    <table style="width:100%;font-size:14px;line-height:1.7;">
      <tr><td style="color:#8c7c6c;width:90px;vertical-align:top;">Gäst</td><td style="font-weight:500;">${params.guestName}</td></tr>
      <tr><td style="color:#8c7c6c;vertical-align:top;">Tillval</td><td>${params.extraTitle}</td></tr>
      <tr><td style="color:#8c7c6c;vertical-align:top;">Pris</td><td>${params.price} ${params.currency}</td></tr>
      <tr><td style="color:#8c7c6c;vertical-align:top;">Bokning</td><td style="font-family:monospace;font-size:12px;">${params.bookingId}</td></tr>
    </table>
    <hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;">
    <p style="font-size:13px;color:#4a4a4a;margin-bottom:24px;">Åtgärd: Kontakta gästen via receptionen för att bekräfta och boka tillvalet.</p>
    <p style="font-size:11px;color:#b5a89a;text-align:center;margin-top:32px;">Grand Hotel Lysekil Gästportal</p>
  </div>`

  await sendAdminNotification(subject, body, html)
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

  const html = `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#faf9f6;">
    <p style="text-align:center;font-size:11px;letter-spacing:0.15em;color:#8c7c6c;text-transform:uppercase;margin-bottom:8px;">Grand Hotel Lysekil</p>
    <h1 style="font-weight:300;font-size:22px;text-align:center;margin:0 0 24px;">${params.language === "en" ? "Welcome" : "Välkommen"}</h1>
    <hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;">
    <p style="font-size:14px;line-height:1.7;color:#4a4a4a;margin-bottom:24px;">
      ${params.language === "en"
        ? `Hi ${params.firstName}! We are looking forward to your visit.`
        : `Hej ${params.firstName}! Vi ser fram emot ditt besök.`}
    </p>
    <p style="font-size:14px;line-height:1.7;color:#4a4a4a;margin-bottom:24px;">
      ${params.language === "en"
        ? `See your booking and explore extras here:`
        : `Se din bokning och utforska tillval här:`}
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${params.url}" style="display:inline-block;padding:14px 28px;background:#1a3a4a;color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:500;">${params.language === "en" ? "Open Guest Portal" : "Öppna gästportal"}</a>
    </div>
    <hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;">
    <p style="font-size:12px;color:#8c7c6c;text-align:center;">
      ${params.language === "en" ? "Questions? Call us at" : "Frågor? Ring oss på"} 0523-101 20
    </p>
    <p style="font-size:11px;color:#b5a89a;text-align:center;margin-top:16px;">Kungsgatan 36 · 453 33 Lysekil</p>
  </div>`

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
      html,
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
  console.log("[Email] sendGuestUpdatedNotification anropad:", params)
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

  const html = `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#faf9f6;">
    <p style="text-align:center;font-size:11px;letter-spacing:0.15em;color:#8c7c6c;text-transform:uppercase;margin-bottom:8px;">Grand Hotel Lysekil</p>
    <h1 style="font-weight:300;font-size:22px;text-align:center;margin:0 0 24px;">Gäst har kompletterat sina uppgifter</h1>
    <hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;">
    <table style="width:100%;font-size:14px;line-height:1.7;">
      <tr><td style="color:#8c7c6c;width:90px;vertical-align:top;">Gäst</td><td style="font-weight:500;">${params.guestName}</td></tr>
      <tr><td style="color:#8c7c6c;vertical-align:top;">Telefon</td><td>${params.phone ?? "(ej angivet)"}</td></tr>
      <tr><td style="color:#8c7c6c;vertical-align:top;">ETA</td><td>${params.eta ?? "(ej angivet)"}</td></tr>
      <tr><td style="color:#8c7c6c;vertical-align:top;">Bokning</td><td style="font-family:monospace;font-size:12px;">${params.bookingId}</td></tr>
    </table>
    ${params.notes ? `<hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;"><p style="font-size:13px;color:#4a4a4a;"><strong>Önskemål:</strong><br>${params.notes.replace(/\n/g, "<br>")}</p>` : ""}
    <hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;">
    <p style="font-size:11px;color:#b5a89a;text-align:center;margin-top:32px;">Grand Hotel Lysekil Gästportal</p>
  </div>`

  await sendAdminNotification(subject, body, html)
}

/**
 * Notifikation: token kunde ej levereras automatiskt — skicka manuellt via extranätet.
 */
export async function sendManualDeliveryNotification(params: {
  guestName: string
  bookingId: string
  guestUrl: string
  reason: "proxy_email" | "no_contact"
  proxyEmail?: string
}): Promise<void> {
  const reasonText = params.reason === "proxy_email"
    ? `Proxy-/skyddad e-postadress (${params.proxyEmail}) — kan ej ta emot automatisk länk.`
    : "Gästen saknar både telefonnummer och e-postadress i systemet."

  const subject = `Manuell länkleverans krävs — ${params.guestName} (${params.bookingId})`

  const body = `
Hej,

Gästlänken till Zuve kunde INTE skickas automatiskt för nedanstående gäst.
Skicka länken manuellt via extranätet.

Gäst:      ${params.guestName}
Bokning:   ${params.bookingId}
Orsak:     ${reasonText}

Länk att skicka till gästen:
${params.guestUrl}

Åtgärd: Gå in i extranätet (Sirvoy), hitta bokning #${params.bookingId} och skicka länken ovan direkt till gästen.

Med vänlig hälsning,
Grand Hotel Lysekil Gästportal
  `.trim()

  const html = `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#faf9f6;">
    <p style="text-align:center;font-size:11px;letter-spacing:0.15em;color:#8c7c6c;text-transform:uppercase;margin-bottom:8px;">Grand Hotel Lysekil</p>
    <h1 style="font-weight:300;font-size:20px;text-align:center;margin:0 0 8px;color:#c0392b;">⚠ Manuell länkleverans krävs</h1>
    <p style="text-align:center;font-size:13px;color:#8c7c6c;margin:0 0 24px;">Gästlänken kunde inte skickas automatiskt</p>
    <hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;">
    <table style="width:100%;font-size:14px;line-height:1.8;">
      <tr><td style="color:#8c7c6c;width:90px;vertical-align:top;">Gäst</td><td style="font-weight:500;">${params.guestName}</td></tr>
      <tr><td style="color:#8c7c6c;vertical-align:top;">Bokning</td><td style="font-family:monospace;font-size:12px;">#${params.bookingId}</td></tr>
      <tr><td style="color:#8c7c6c;vertical-align:top;">Orsak</td><td style="color:#c0392b;font-size:13px;">${reasonText}</td></tr>
    </table>
    <hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;">
    <p style="font-size:13px;color:#4a4a4a;margin-bottom:12px;font-weight:500;">Länk att skicka till gästen:</p>
    <div style="background:#f0ede8;border-radius:6px;padding:14px 16px;word-break:break-all;">
      <a href="${params.guestUrl}" style="color:#1a3a4a;font-size:13px;font-family:monospace;">${params.guestUrl}</a>
    </div>
    <hr style="border:0;height:1px;background:#d4cfc7;margin:24px 0;">
    <p style="font-size:13px;color:#4a4a4a;">
      <strong>Åtgärd:</strong> Gå in i extranätet (Sirvoy), hitta bokning <strong>#${params.bookingId}</strong> och skicka länken ovan direkt till gästen.
    </p>
    <p style="font-size:11px;color:#b5a89a;text-align:center;margin-top:32px;">Grand Hotel Lysekil Gästportal</p>
  </div>`

  await sendAdminNotification(subject, body, html)
}

export async function sendGuestExtraConfirmation({
  guestName,
  guestEmail,
  extraTitle,
  price,
  currency,
}: {
  guestName: string;
  guestEmail: string;
  extraTitle: string;
  price: number;
  currency: string;
}): Promise<void> {
  if (COMMUNICATION_DISABLED) return;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    requireTLS: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1c2e36;">
      <p style="color:#8a7f72;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Grand Hotel Lysekil</p>
      <h2 style="font-weight:600;font-size:20px;margin:8px 0;">Din beställning är mottagen</h2>
      <p>Hej ${guestName},</p>
      <p>Tack! Vi har tagit emot din intresseanmälan för <strong>${extraTitle}</strong> (${price} ${currency}). Receptionen förbereder detta inför din ankomst.</p>
      <p>Har du frågor? Ring oss på <a href="tel:+46523611000">0523-61 10 00</a>.</p>
      <p style="margin-top:32px;color:#8a7f72;font-size:12px;">Grand Hotel Lysekil · Kungsgatan 36, 453 33 Lysekil</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Grand Hotel Lysekil" <${SMTP_USER}>`,
    to: guestEmail,
    subject: `Beställning bekräftad: ${extraTitle}`,
    html,
    text: `Hej ${guestName}, tack för din intresseanmälan för ${extraTitle} (${price} ${currency}). Ring 0523-101 20 om du har frågor.`,
  });
}
