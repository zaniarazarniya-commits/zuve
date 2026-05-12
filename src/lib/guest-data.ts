// ============================================================
// REDIGERBAR DATA för gästupplevelsen
// Ändra, lägg till eller ta bort objekt här — de visas automatiskt i appen
// ============================================================

export interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  tag?: string;
}

// --- TILLVAL / UPSELLS ---
export const upsells: UpsellItem[] = [
  {
    id: "mini-treat",
    title: "Mini-Treat",
    description: "2 miniflaskor mousserande och något sött väntar på rummet.",
    price: 395,
    currency: "kr",
    imageUrl: "/Tillval/minitreat.png",
    tag: "Populär",
  },
  {
    id: "bubbel-cava",
    title: "Bubbel — Cava",
    description: "Iskall cava & choklad väntar på rummet.",
    price: 549,
    currency: "kr",
    imageUrl: "/Tillval/BubbelCava.png",
  },
  {
    id: "bubbel-champagne",
    title: "Bubbel — Champagne",
    description: "Iskall champagne & choklad väntar på rummet.",
    price: 1595,
    currency: "kr",
    imageUrl: "/Tillval/Bubbel%20Champange.png",
    tag: "Lyxa till det",
  },
  {
    id: "tapas-wine",
    title: "Tapas & Wine",
    description: "En god flaska Rioja med blandade tapas & delikatesser från Luna Vingård & Restaurang. Kan avnjutas på hotellet i ert rum, i Grands Bibliotek eller som picknick att ta med. Förbokas minst 2 dagar före ankomst.",
    price: 1195,
    currency: "kr",
    imageUrl: "/Tillval/tapas.png",
    tag: "För 2 personer",
  },
  {
    id: "skaldjur-bubbel",
    title: "Skaldjur & Bubbel",
    description: "Färska räkor, kräftor & bubbel för två personer. Förbokas minst 5 dagar före ankomst. (Dagspris juni–september, se lågsäsongspris nedan.)",
    price: 1590,
    currency: "kr",
    imageUrl: "/Tillval/Skaldjurbubbel.png",
    tag: "Lågsäsong",
  },
  {
    id: "spa-kurort",
    title: "Äkta SPA Kurortsstil",
    description: "Kallbad & bastu inkl. handdukar och morgonrock samt välkomstbubbel för två.",
    price: 795,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
    tag: "För 2 personer",
  },
  {
    id: "massage-30",
    title: "Massage 30 min",
    description: "Avslappnande massagebehandling på 30 minuter.",
    price: 595,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop",
  },
  {
    id: "massage-60",
    title: "Massage 60 min",
    description: "Djupgående massagebehandling på 60 minuter.",
    price: 1190,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop",
    tag: "Rekommenderad",
  },
  {
    id: "head-spa",
    title: "Head SPA 60 min",
    description: "Exklusiv head spa-behandling på 60 minuter.",
    price: 1390,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&h=400&fit=crop",
    tag: "Premium",
  },
  {
    id: "early-checkin",
    title: "Tidig incheckning 12:00",
    description: "Checka in redan kl 12:00 och få en längre dag på hotellet.",
    price: 300,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
  },
  {
    id: "late-checkout",
    title: "Sen utcheckning 14:00",
    description: "Behåll rummet till kl 14:00 och njut av en lugn sista morgon utan stress.",
    price: 300,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1631049552057-38d34f6dd2a4?w=600&h=400&fit=crop",
  },
];

// --- GRAND REKOMMENDERAR ---
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tag?: string;
  meta?: string;
  link?: string;
  phone?: string;
}

export const recommendations: Recommendation[] = [
  {
    id: "luna-vingard",
    title: "Luna Vingård & Restaurang",
    description: "Lysekils topprestaurang — rankad #1 på Tripadvisor. Traditionella spanska tapas, smakmenyer och avsmakningsrätter serveras på vingården med över 5 000 egna vinrankor. Boka ett bord för en kväll ni sent glömmer.",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    tag: "Grand rekommenderar",
    meta: "Spanskt · Fusion · Vingård",
    phone: "0523-131 40",
    link: "https://lunalysekil.se",
  },
  {
    id: "luna-asian",
    title: "Luna Asian Tapas",
    description: "Asiatisk fusion i tapasform — direkt under Grand Hotel på Kungstorget. Handgjorda rätter där österländska smaker möter tapaskulturen i en unik och innovativ kombination. Perfekt för tapas, cocktails och sena kvällar. Öppen sommarsäsong.",
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop",
    tag: "Grand rekommenderar",
    meta: "Asiatisk fusion · Sommarsäsong",
    phone: "0523-131 40",
    link: "https://lunalysekil.se",
  },
  {
    id: "strandpromenaden",
    title: "Strandpromenaden i Norra hamnen",
    description: "Lysekils nyaste pärlsträngs­promenad, färdigställd 2023. Slingrande träbordgångar leder dig längs klipporna från Gamlestan hela vägen till Valbodalen med Västerhavet som ständig sällskap. Perfekt för en lugn morgonpromenad eller en solnedgångsstund vid havet.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    tag: "Promenad",
    meta: "Gratis · Hela dagen",
  },
  {
    id: "stangehuvud",
    title: "Stångehuvuds naturreservat",
    description: "Bohusläns klippor i sitt renaste format. Naturreservatet vid södra spetsen av Stångenäset bjuder på vandringsleder, badbukter och dramatiska granitklippor formade för 920 miljoner år sedan. Bäst besökt vid solnedgången — då lyser klipporna i guld.",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    tag: "Natur",
    meta: "Gratis · 15 min från hotellet",
  },
  {
    id: "havets-hus",
    title: "Havets Hus",
    description: "Bohuslän under ytan. Ett av Skandinaviens mest uppskattade akvarium med 80 000 besökare varje år. Vandra genom tunnelakvariet omgiven av rockor och torsk, möt hajar och bläckfisk. Akvarievattnet pumpas direkt från 32 meters djup i Gullmarn.",
    imageUrl: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=600&h=400&fit=crop",
    tag: "Sevärdhet",
    meta: "Strandvägen 9 · Öppet året om",
    link: "https://www.havetshus.se",
  },
];
