// ============================================================
// TESTSKRIPT: Testa webhook mot PRODUKTION
// ============================================================
// Kör: node scripts/test-prod-webhook.js
//
// Detta skickar en fake Sirvoy-bokning till DIN PRODUKTIONS-webhook
// så du kan se om allt fungerar live.
// ============================================================

async function testProdWebhook() {
  const WEBHOOK_URL = "https://gast.grandhotellysekil.se/api/webhook/booking"
  const WEBHOOK_SECRET = "grand-lysekil-2026-secret"

  const fakePayload = {
    version: "1.0",
    event: "new",
    propertyId: 12345,
    bookingId: 888888,
    arrivalDate: "2026-07-15",
    departureDate: "2026-07-17",
    cancelled: false,
    eta: "14:00",
    totalAdults: 2,
    currency: "SEK",
    totalPrice: 2400,
    totalPriceIncludingSurcharges: 2640,
    bookingSource: "sirvoy",
    bookingIsCheckedIn: false,
    bookingIsCheckedOut: false,
    bookingIsConfirmed: true,
    guest: {
      firstName: "Prod",
      lastName: "Test",
      email: "prodtest@example.com",
      phone: "070-791 57 74",
      language: "sv",
      message: "Test från produktion",
    },
    rooms: [
      {
        RoomName: "202",
        RoomTypeName: "Normal Dubbel",
        RoomId: 1,
        arrivalDate: "2026-07-15",
        departureDate: "2026-07-17",
        adults: 2,
        price: 2400,
        roomTotal: 2640,
      },
    ],
  }

  console.log("🚀 Skickar test-bokning till PRODUKTION...")
  console.log("URL:", WEBHOOK_URL)
  console.log("")

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify(fakePayload),
    })

    const data = await response.json()

    if (response.ok) {
      console.log("✅ PRODUKTION webhook svarade OK!")
      console.log("Status:", response.status)
      console.log("Svar:", JSON.stringify(data, null, 2))
      console.log("")
      console.log("📱 Om allt fungerar bör ett SMS skickas till:", fakePayload.guest.phone)
      console.log("🔗 Gästlänken:", `https://gast.grandhotellysekil.se/guest/${data.booking?.guest_token}`)
    } else {
      console.log("❌ PRODUKTION webhook fel:")
      console.log("Status:", response.status)
      console.log("Svar:", JSON.stringify(data, null, 2))
    }
  } catch (err) {
    console.error("❌ Kunde inte nå produktion:", err.message)
  }
}

testProdWebhook()
