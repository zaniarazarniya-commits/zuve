// ============================================================
// FIL: src/lib/group-checkin-data.ts
//
// Gruppincheckning — deltagarlistor för företagsgrupper som
// checkar in många gäster samtidigt.
//
// Gästen skannar en QR-kod, hittar sitt namn i listan, fyller i
// e-post och telefon och får då sitt rumsnummer. Ingen papperslapp
// i receptionen.
//
// ⚠️ DENNA FIL ÄR SERVER-ONLY.
// Den importeras bara av API-routes, aldrig av en klientkomponent.
// Annars skulle hela rumsfördelningen hamna i webbläsarens
// JS-bundle och vem som helst kunde läsa vem som bor var.
//
// SÅ HÄR LÄGGER DU UPP EN NY GRUPP:
//   1. Kopiera ett block nedan och sätt en egen `slug`.
//      Slugen ligger i URL:en och ska vara omöjlig att gissa —
//      lägg på några slumpmässiga tecken på slutet.
//   2. Fyll i `guests` med ett objekt per person.
//      `key` måste vara unik inom gruppen och får INTE ändras
//      efter att QR-koden gått ut (den kopplar ihop personen med
//      det som redan sparats i databasen).
//   3. `roomType` är den gästvänliga rumstypen — aldrig Sirvoys
//      interna rumsnamn, de innehåller anteckningar som inte ska
//      visas för gästen.
// ============================================================

export type GroupGuest = {
  /** Stabil identifierare inom gruppen. Ändra aldrig i efterhand. */
  key: string
  /** Namnet som gästen letar efter i listan. */
  name: string
  /** Rumsnummer, t.ex. "203". Visas först efter ifyllda uppgifter. */
  room: string
  /** Gästvänlig rumstyp, t.ex. "Dubbelrum". */
  roomType: string
}

export type CheckinGroup = {
  /** Del av URL:en: /incheckning/<slug>. Ska vara ogissbar. */
  slug: string
  /** Företagsnamn som visas på sidan och flyern. */
  company: string
  /** Sirvoys bokningsnummer — för receptionens spårbarhet. */
  bookingId: string
  /** ISO-datum, t.ex. "2026-09-03". */
  checkIn: string
  checkOut: string
  guests: GroupGuest[]
}

// ============================================================
// GRUPPER
// ============================================================

const nokalux: CheckinGroup = {
  slug: "nokalux-k4m7v9",
  company: "Nokalux",
  bookingId: "61110",
  checkIn: "2026-09-03",
  checkOut: "2026-09-04",
  guests: [
    { key: "joacim-hallberg", name: "Joacim Hallberg", room: "111", roomType: "Small twin" },
    { key: "anton-karlsson", name: "Anton Karlsson", room: "111", roomType: "Small twin" },
    { key: "staffan-eriksson", name: "Staffan Eriksson", room: "112", roomType: "Small twin" },
    { key: "magnus-orrby", name: "Magnus Orrby", room: "112", roomType: "Small twin" },
    { key: "marcus-lindblad", name: "Marcus Lindblad", room: "113", roomType: "Litet dubbelrum" },
    { key: "mikael-flemin", name: "Mikael Flemin", room: "113", roomType: "Litet dubbelrum" },
    { key: "jerry-persson", name: "Jerry Persson", room: "201", roomType: "Enkelrum" },
    { key: "pernilla-westin", name: "Pernilla Westin", room: "202", roomType: "Dubbelrum" },
    { key: "joanna-wankowicz", name: "Joanna Wankowicz", room: "203", roomType: "Dubbelrum" },
    { key: "johan-kjellsson", name: "Johan Kjellsson", room: "204", roomType: "Dubbelrum" },
    { key: "linda-plate", name: "Linda Plate", room: "206", roomType: "Enkelrum" },
    { key: "rebecka-bergqvist", name: "Rebecka Bergqvist", room: "207", roomType: "Dubbelrum twin" },
    { key: "taina-lindell", name: "Taina Lindell", room: "207", roomType: "Dubbelrum twin" },
    { key: "nicklas-kvist", name: "Nicklas Kvist", room: "210", roomType: "Enkelrum" },
    { key: "peter-elofsson", name: "Peter Elofsson", room: "211", roomType: "Small twin" },
    { key: "joakim-axelsson", name: "Joakim Axelsson", room: "211", roomType: "Small twin" },
    { key: "johanna-blomqvist", name: "Johanna Blomqvist", room: "212", roomType: "Litet dubbelrum" },
    { key: "ragnar-pedersen", name: "Ragnar Pedersen", room: "303", roomType: "Dubbelrum" },
    { key: "christian-glader", name: "Christian Glader", room: "304", roomType: "Dubbelrum twin" },
    { key: "viktor-magnusson", name: "Viktor Magnusson", room: "304", roomType: "Dubbelrum twin" },
    { key: "magnus-jonsson", name: "Magnus Jonsson", room: "306", roomType: "Dubbelrum" },
    { key: "ola-malmstrom", name: "Ola Malmström", room: "307", roomType: "Familjerum" },
    { key: "adam-hagstrom", name: "Adam Hagström", room: "307", roomType: "Familjerum" },
    { key: "fredrik-reis", name: "Fredrik Reis", room: "500", roomType: "Svit" },
    { key: "christopher-van-leeuwen", name: "Christopher Van Leeuwen", room: "500", roomType: "Svit" },
  ],
}

export const checkinGroups: CheckinGroup[] = [nokalux]

// ============================================================
// HJÄLPFUNKTIONER
// ============================================================

/** Hämtar en grupp via dess slug, eller null om den inte finns. */
export function getGroup(slug: string): CheckinGroup | null {
  return checkinGroups.find((g) => g.slug === slug) ?? null
}

/** Hämtar en person i en grupp via dess key, eller null. */
export function getGroupGuest(group: CheckinGroup, key: string): GroupGuest | null {
  return group.guests.find((g) => g.key === key) ?? null
}

/**
 * Räknar ut våningsplan från rumsnumret ("203" → 2, "500" → 5).
 * Returnerar null för rum som inte börjar med en siffra.
 */
export function floorFromRoom(room: string): number | null {
  const first = room.trim()[0]
  if (!first || !/\d/.test(first)) return null
  return Number(first)
}
