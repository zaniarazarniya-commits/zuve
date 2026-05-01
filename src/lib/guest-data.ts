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

export interface Activity {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tag?: string;
  link?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cuisine?: string;
  distance?: string;
  phone?: string;
  link?: string;
}

// --- TILLVAL / UPSELLS ---
export const upsells: UpsellItem[] = [
  {
    id: "mini-treat",
    title: "Mini-Treat",
    description: "2 miniflaskor mousserande och något sött väntar på rummet.",
    price: 395,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop",
    tag: "Populär",
  },
  {
    id: "bubbel-cava",
    title: "Bubbel — Cava",
    description: "Iskall cava & choklad väntar på rummet.",
    price: 549,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
  },
  {
    id: "bubbel-champagne",
    title: "Bubbel — Champagne",
    description: "Iskall champagne & choklad väntar på rummet.",
    price: 1595,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1594146865716-016d5b9465d5?w=600&h=400&fit=crop",
    tag: "Lyxa till det",
  },
  {
    id: "tapas-wine",
    title: "Tapas & Wine",
    description: "En god flaska Rioja med blandade tapas & delikatesser från Luna Vingård & Restaurang. Kan avnjutas på hotellet i ert rum, i Grands Bibliotek eller som picknick att ta med. Förbokas minst 2 dagar före ankomst.",
    price: 1195,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=600&h=400&fit=crop",
    tag: "För 2 personer",
  },
  {
    id: "skaldjur-bubbel",
    title: "Skaldjur & Bubbel",
    description: "Färska räkor, kräftor & bubbel för två personer. Förbokas minst 5 dagar före ankomst. (Dagspris juni–september, se lågsäsongspris nedan.)",
    price: 1590,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop",
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

// --- AKTIVITETER I LYSEKIL ---
export const activities: Activity[] = [
  {
    id: "kallbadhuset",
    title: "Lysekil Kallbadhus",
    description: "Bohusläns vackraste kallbadhus — bada i salt hav och värma dig i bastun med milsvid utsikt över Gullmarsfjorden.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    tag: "Bad & Spa",
    link: "https://www.lysekils-kallbadhus.se",
  },
  {
    id: "pinnevik",
    title: "Pinneviksbadet",
    description: "Populärt familjebad med klippor, sandstrand och brygga. Perfekt för ett morgondopp eller lata eftermiddagar.",
    imageUrl: "https://images.unsplash.com/photo-1520942702018-0865700d992e?w=600&h=400&fit=crop",
    tag: "Bad",
  },
  {
    id: "havets-hus",
    title: "Havets Hus",
    description: "Nordens största akvarium med fisk och skaldjur från västkusten. Ett måste för hela familjen — utforska havet under ytan.",
    imageUrl: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=600&h=400&fit=crop",
    tag: "Sevärdhet",
    link: "https://www.havetshus.se",
  },
  {
    id: "skargardstur",
    title: "Skärgårdstur",
    description: "Guidad båttur genom Bohusläns vackra skärgård med öppet hav och gömda vikar. Sälsafari på sommaren.",
    imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop",
    tag: "Utomhus",
  },
  {
    id: "stangehuvud",
    title: "Stångehuvud Naturreservat",
    description: "Vandringsleder längs havet med milsvid utsikt och dramatiska klippformationer. Bäst vid solnedgång.",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    tag: "Natur",
  },
  {
    id: "kajak",
    title: "Kajakpaddling",
    description: "Hyra kajak och utforska kusten på egen hand. Lugnare vatten på morgonen — perfekt för nybörjare.",
    imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop",
    tag: "Äventyr",
  },
  {
    id: "kungshamn",
    title: "Kungshamn & Smögen",
    description: "En kort biltur bort ligger pittoreska Smögen med sitt berömda bryggliv och färsk fisk.",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    tag: "Utflykt",
  },
];

// --- RESTAURANGER ---
export const restaurants: Restaurant[] = [
  {
    id: "luna-vingard",
    name: "Luna Vingård & Restaurang",
    description: "En oförglömlig kulinarisk resa på våra restauranger och vingård. Njut av traditionella spanska och fusion tapas, avsmakningsmenyer och vingårdsvandringar med vinpacket.",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    cuisine: "Spanskt · Fusion tapas · Vingård",
    distance: "5 min",
    phone: "0523-131 40",
    link: "https://lunavingard.se",
  },
  {
    id: "luna-asian",
    name: "Luna Asian Tapas",
    description: "Asiatisk fusion i tapasform belägen i hjärtat av Lysekil centrum, under Grand Hotel. En unik kulinarisk upplevelse där spanska tapas möter asiatiska smaker i en harmonisk och innovativ blandning. Lunch, tapas och middagar. Endast öppen under sommaren.",
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop",
    cuisine: "Asiatisk fusion · Tapas",
    distance: "5 min",
    phone: "0523-131 40",
    link: "https://lunavingard.se",
  },
  {
    id: "old-house",
    name: "The Old House Inn",
    description: "Mitt i centrum av Lysekil. En självklar mötesplats med gedigen atmosfär, gamla stenväggar och ståtliga takbjälkar. Lavastensgrill och omsorgsfullt utvalt kött för den köttälskande. En pub, ett steakhouse, en restaurang — där alla är välkomna.",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    cuisine: "Pub · Steakhouse",
    distance: "20 m",
    phone: "0523-120 50",
    link: "https://oldhouseinn.se",
  },
  {
    id: "kajmagasinet",
    name: "Kajmagasinet",
    description: "En naturlig samlingspunkt direkt vid vattnet. Njut av sena sommarkvällar på trädäcket eller slå dig ner i de rymliga lokalerna inomhus. Bra mat, supernice bar, dart och biljard.",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=600&h=400&fit=crop",
    cuisine: "Restaurang & Bar",
    distance: "300 m",
    phone: "0523-122 30",
    link: "https://kajmagasinet.se",
  },
  {
    id: "wolffs",
    name: "Wolff's Kitchen",
    description: "En liten ägar-driven restaurang i hjärtat av Lysekil med en roterande lunch- och middagsmeny gjord på lokala ingredienser. Darius 'the Wolff' lagar mat med inspiration från Melbourne och sina resor. Välj mellan The Kitchen Bar vid det öppna köket eller The Table Room med bistrostil.",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    cuisine: "Modernt · Lokalt",
    distance: "400 m",
    phone: "0523-125 60",
    link: "https://wolffskitchen.se",
  },
  {
    id: "norra-hamnen",
    name: "Norra Hamnen 5",
    description: "Premium restaurang med perfekt läge vid Norra Hamnen. Starkt präglad av hög kvalitet och lokala råvaror från kust och hav. Poängbedömd i White Guide sedan öppningen 2012. En helhetsupplevelse av mat, dryck och atmosfär.",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    cuisine: "Fisk & Skaldjur · White Guide",
    distance: "500 m",
    phone: "0523-128 40",
    link: "https://norrahamnen5.se",
  },
];
