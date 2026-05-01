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
    id: "breakfast",
    title: "Frukost på rummet",
    description: "Nybakade bullar, färska bär, yoghurt och kaffe levererat till ditt rum varje morgon.",
    price: 195,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1533089862017-5614ecb352ae?w=600&h=400&fit=crop",
    tag: "Populär",
  },
  {
    id: "parking",
    title: "Parkering",
    description: "Säker privat parkeringsplats i direkt anslutning till hotellet under hela din vistelse.",
    price: 150,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&h=400&fit=crop",
    tag: "Per natt",
  },
  {
    id: "late-checkout",
    title: "Sen utcheckning",
    description: "Behåll rummet till kl 14:00 och njut av en lugn sista morgon utan stress.",
    price: 495,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
  },
  {
    id: "welcome-gift",
    title: "Välkomstpresent",
    description: "En handplockad presentpåse med lokala delikatesser, choklad och en flaska bubbel.",
    price: 595,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop",
    tag: "Bästsäljare",
  },
  {
    id: "afternoon-tea",
    title: "Afternoon Tea",
    description: "Klassiskt afternoon tea i vår ljusa lounge med utsikt över havet. För 2 personer.",
    price: 345,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop",
  },
  {
    id: "spa",
    title: "Spapaket",
    description: "Tillgång till bastu, jacuzzi och relaxavdelning. Inkluderar badrock och tofflor.",
    price: 425,
    currency: "kr",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
    tag: "Rekommenderad",
  },
];

// --- AKTIVITETER I LYSEKIL ---
export const activities: Activity[] = [
  {
    id: "havsbad",
    title: "Pinneviksbadet",
    description: "Populärt havsbad med klippor, sandstrand och brygga. Perfekt för ett morgondopp.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    tag: "Bad",
  },
  {
    id: "akvarium",
    title: "Havets Hus",
    description: "Nordens största akvarium med fisk och skaldjur från västkusten. Ett måste för hela familjen.",
    imageUrl: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=600&h=400&fit=crop",
    tag: "Sevärdhet",
  },
  {
    id: "skargard",
    title: "Skärgårdstur",
    description: "Guidad båttur genom Bohusläns vackra skärgård med öppet hav och gömda vikar.",
    imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop",
    tag: "Utomhus",
  },
  {
    id: "vandring",
    title: "Stångehuvud",
    description: "Vandringsled längs havet med milsvid utsikt. Bäst vid solnedgång.",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    tag: "Natur",
  },
  {
    id: "kajak",
    title: "Kajakpaddling",
    description: "Hyra kajak och utforska kusten på egen hand. Lugnare vatten på morgonen.",
    imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop",
    tag: "Äventyr",
  },
];

// --- RESTAURANGER ---
export const restaurants: Restaurant[] = [
  {
    id: "strandfickan",
    name: "Strandfickan",
    description: "Hemtrevlig restaurang med fokus på lokala råvaror och färsk fisk. Uteservering med havsutsikt.",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    cuisine: "Svenskt · Fisk",
    distance: "200 m",
    phone: "0523-120 34",
  },
  {
    id: "bryggan",
    name: "Bryggan",
    description: "Avslappnad gastropub vid gästhamnen. Fantastiska hamburgare och ett brett ölutbud.",
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop",
    cuisine: "Gastropub",
    distance: "400 m",
    phone: "0523-125 80",
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
    id: "curryhouse",
    name: "Lysekil Curry House",
    description: "Prisvärd indisk restaurang med generösa portioner och vänlig service.",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    cuisine: "Indiskt",
    distance: "500 m",
    phone: "0523-130 45",
  },
  {
    id: "vinbar",
    name: "Vinolento",
    description: "Intim vinbar med noggrant utvalda viner och charktallrikar. Perfekt för en sen kväll.",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    cuisine: "Vinbar",
    distance: "250 m",
    phone: "0523-128 90",
  },
];
