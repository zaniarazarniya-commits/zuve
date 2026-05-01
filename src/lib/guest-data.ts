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
    id: "grand",
    name: "Grand Hotel Lysekil — Restaurang",
    description: "Hotellets egen restaurang med fokus på västkustens skaldjur, färsk fisk och lokala råvaror. Frukost, lunch och á la carte.",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    cuisine: "Svenskt · Skaldjur",
    distance: "0 m",
    phone: "0523-101 20",
  },
  {
    id: "strandfickan",
    name: "Strandfickan",
    description: "Hemtrevlig restaurang med fokus på lokala råvaror och färsk fisk. Uteservering med havsutsikt.",
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop",
    cuisine: "Svenskt · Fisk",
    distance: "200 m",
    phone: "0523-120 34",
  },
  {
    id: "fiskekrogen",
    name: "Fiskekrogen",
    description: "Klassisk fiskerestaurang med rätter direkt från lokala fiskare. Räkmackan är legendarisk.",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=600&h=400&fit=crop",
    cuisine: "Fisk & Skaldjur",
    distance: "350 m",
    phone: "0523-122 10",
  },
  {
    id: "bryggan",
    name: "Bryggan",
    description: "Avslappnad gastropub vid gästhamnen. Fantastiska hamburgare och ett brett ölutbud.",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    cuisine: "Gastropub",
    distance: "400 m",
    phone: "0523-125 80",
  },
  {
    id: "luna",
    name: "Luna Vingård & Restaurang",
    description: "Vingård och restaurang med ekologiska viner och närproducerade råvaror. Perfekt för en romantisk middag.",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    cuisine: "Vin & Mat",
    distance: "600 m",
    phone: "0523-131 40",
  },
  {
    id: "vinolento",
    name: "Vinolento",
    description: "Intim vinbar med noggrant utvalda viner och charktallrikar. Perfekt för en sen kväll.",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=600&h=400&fit=crop",
    cuisine: "Vinbar",
    distance: "250 m",
    phone: "0523-128 90",
  },
];
