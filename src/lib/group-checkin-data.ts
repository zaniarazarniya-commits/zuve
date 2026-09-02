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
  /**
   * Tvinga fram att gästen kompletterar sitt namn, eller stäng av kravet.
   * Utan värde avgörs det av `guestNeedsFullName`. Sätt false för någon
   * som faktiskt bara har ett namn.
   */
  needsFullName?: boolean
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
  /**
   * Valfri rad som visas för gästen ovanför namnlistan. Använd när listan
   * behöver en förklaring, t.ex. att namnen är ofullständiga i bokningen.
   */
  note?: string
  /**
   * Hälsning från hotellet till gruppen. Sätts bara för grupper som ska
   * kännas särskilt tilltalade — utan den ser sidan ut som vanligt.
   */
  welcome?: {
    /** Skrivstilsrubriken på steg 1. Utan den står "Hitta ditt namn". */
    heading: string
    /** Kort hälsning under guldlinjen, ersätter standardinstruktionen. */
    message: string
  }
  /**
   * Kräv att gästen registrerar minibarkortet INNAN rumsnumret visas.
   * Kortet får då ett eget steg, och rummet avslöjas först när Stripe
   * bekräftat att kortet sparats. Ingen väg förbi — kan gästen inte
   * registrera ett kort får receptionen lösa det manuellt.
   *
   * Steget hoppas över om STRIPE_SECRET_KEY saknas, eftersom det då är
   * omöjligt att genomföra och sidan annars hade blivit en återvändsgränd.
   */
  cardBeforeRoom?: boolean
  /**
   * Fråga gästen om hen stannar ytterligare en natt. Sätt bara för grupper
   * som sträcker sig över flera nätter — då måste gästen välja aktivt, så att
   * receptionen och städet vet vilka rum som ska vändas.
   */
  secondNight?: {
    /** Frågan som visas i formuläret. */
    question: string
    /** Text på knappen för den som stannar. */
    stayLabel: string
    /** Text på knappen för den som checkar ut. */
    leaveLabel: string
  }
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
  welcome: {
    heading: "Välkommen!",
    message:
      "Vi har gjort i ordning era rum och ser fram emot att ha er hos oss. " +
      "Välj ditt namn nedan så visar vi var du bor.",
  },
  cardBeforeRoom: true,
  secondNight: {
    question: "Stannar du även fredag natt?",
    stayLabel: "Ja, till lördag",
    leaveLabel: "Nej, jag åker fredag",
  },
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

// ------------------------------------------------------------
// Nokalux, natt två (fre 4 sep → lör 5 sep).
//
// Bokningen omfattar 37 gäster, men bara de 21 nyanlända står här.
// De 16 som bor kvar från torsdagen behåller sina rum och nycklar och
// ska inte checka in en gång till — de finns därför inte i listan.
//
// ⚠️ Namnen nedan är avkortade i Sirvoy och står här precis som de visas
// där. Vissa personer har bara förnamn, andra förnamn plus en initial.
// Har du fullständiga namn: skriv över `name`, men rör inte `key`.
//
// ⚠️ Bokningen anger 37 gäster. 16 kvarboende + de 20 namn som går att
// utläsa blir 36 — någonstans finns en person till, sannolikt i rum 213
// som är ett litet familjerum för tre. Lägg till raden här när namnet är
// känt. Fram till dess hänvisas den personen till receptionen, vilket
// sidan redan säger till den som inte hittar sitt namn.
// ------------------------------------------------------------
const nokaluxFredag: CheckinGroup = {
  slug: "nokalux-fredag-r8t2xq",
  company: "Nokalux",
  bookingId: "61112",
  checkIn: "2026-09-04",
  checkOut: "2026-09-05",
  welcome: {
    heading: "Välkommen!",
    message:
      "Vi har gjort i ordning era rum. Välj ditt namn nedan så visar vi var du bor.",
  },
  cardBeforeRoom: true,
  note: "Namnen står som i bokningen — vissa bara med förnamn. Bor du kvar sedan i går behåller du ditt rum och behöver inte göra något här.",
  guests: [
    { key: "gustav", name: "Gustav", room: "110", roomType: "Familjerum" },
    { key: "jerry", name: "Jerry", room: "110", roomType: "Familjerum" },
    { key: "rebecca-g", name: "Rebecca G", room: "202", roomType: "Dubbelrum" },
    { key: "rebecka-n", name: "Rebecka N", room: "202", roomType: "Dubbelrum" },
    { key: "pemika", name: "Pemika", room: "204", roomType: "Dubbelrum" },
    { key: "sigita", name: "Sigita", room: "204", roomType: "Dubbelrum" },
    { key: "hanne", name: "Hanne", room: "212", roomType: "Small twin" },
    { key: "therese", name: "Therese", room: "212", roomType: "Small twin" },
    { key: "helene", name: "Helene", room: "213", roomType: "Dubbelrum twin" },
    { key: "kajsa", name: "Kajsa", room: "213", roomType: "Dubbelrum twin" },
    { key: "annika", name: "Annika", room: "302", roomType: "Dubbelrum med havsutsikt" },
    { key: "lena-s", name: "Lena S", room: "302", roomType: "Dubbelrum med havsutsikt" },
    { key: "marie-j", name: "Marie J", room: "303", roomType: "Dubbelrum" },
    { key: "maja", name: "Maja", room: "303", roomType: "Dubbelrum" },
    { key: "lennie", name: "Lennie", room: "304", roomType: "Dubbelrum twin" },
    { key: "fredrik-e", name: "Fredrik E", room: "304", roomType: "Dubbelrum twin" },
    { key: "asa-o", name: "Åsa O", room: "400", roomType: "Svit med kök" },
    { key: "pia", name: "Pia", room: "400", roomType: "Svit med kök" },
    { key: "mona", name: "Mona", room: "500", roomType: "Svit" },
    { key: "ase-p", name: "Åse P", room: "500", roomType: "Svit" },
  ],
}

export const checkinGroups: CheckinGroup[] = [nokalux, nokaluxFredag]

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
 * Ser namnet fullständigt ut? Kräver minst två delar där den sista är mer
 * än en bokstav, så att "Maja" och "Rebecca G" räknas som ofullständiga
 * medan "Joacim Hallberg" och "Christopher Van Leeuwen" godkänns.
 */
export function isCompleteName(name: string): boolean {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return false
  return parts[parts.length - 1].replace(/\.$/, "").length >= 2
}

/**
 * Ska gästen ombes komplettera sitt namn vid incheckningen?
 *
 * Sirvoy kortar av namnen i vissa bokningar, och då står bara förnamnet
 * eller förnamn plus en initial i listan. Receptionen behöver hela namnet.
 */
export function guestNeedsFullName(guest: GroupGuest): boolean {
  return guest.needsFullName ?? !isCompleteName(guest.name)
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
