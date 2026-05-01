// ============================================================
// TESTSKRIPT: Simulera Sirvoy-webhook lokalt
// ============================================================
// Kör: node scripts/test-webhook.js
//
// Detta skickar en fake bokning till din lokala webhook
// så du kan testa att allt fungerar utan att vänta på riktiga bokningar.
// ============================================================

async function testWebhook() {
  const WEBHOOK_URL = "http://localhost:3000/api/webhook/booking"
  const WEBHOOK_SECRET = "grand-lysekil-2026-secret"

  // En fake Sirvoy-payload (nästan identisk med riktig data)
  const fakePayload = {
    version: "1.0",
    event: "new",
    propertyId: 12345,
    bookingId: 999999,
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
      firstName: "Test",
      lastName: "Person",
      email: "test@example.com",
      phone: "070-791 57 74",
      language: "sv",
      message: "Allergi mot nötter",
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

  console.log("🧪 Skickar fake Sirvoy-bokning till webhook...")
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
      console.log("✅ Webhook svarade OK!")
      console.log("Status:", response.status)
      console.log("Svar:", JSON.stringify(data, null, 2))
      console.log("")
      console.log("📱 Om telefon finns bör ett SMS ha skickats till:", fakePayload.guest.phone)
      console.log("🔗 Gästlänken:", `http://localhost:3000/guest/${data.booking?.guest_token}`)
    } else {
      console.log("❌ Webhook fel:")
      console.log("Status:", response.status)
      console.log("Svar:", JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.log("❌ Kunde inte anropa webhook:")
    console.log(error.message)
    console.log("")
    console.log("💡 Tips: Se till att dev-servern är igång (npm run dev)")
  }
}

testWebhook()
