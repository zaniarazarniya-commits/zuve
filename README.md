# Zuve — Grand Hotel Lysekil Gästportal

En personlig gästportal för Grand Hotel Lysekil. Gäster får ett SMS med en unik länk där de kan se sin bokning, lägga till tillval och upptäcka det bästa av Lysekil.

## Teknikstack

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **TypeScript**
- **Supabase** (PostgreSQL + Row Level Security)
- **46elks** (SMS-utskick)
- **Nodemailer** (e-postnotifikationer)
- **Sirvoy** (bokningssystem via webhook)

## Miljövariabler

Kopiera `.env.example` till `.env.local` och fyll i:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ditt-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Sirvoy Webhook
SIRVOY_WEBHOOK_SECRET=valfri-hemlig-nyckel

# 46elks SMS
ELKS_API_USERNAME=u...
ELKS_API_PASSWORD=...
ELKS_FROM_NUMBER=GrandHotel

# E-post (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@grandhotellysekil.se
SMTP_PASS=...
ADMIN_EMAIL=info@grandhotellysekil.se

# App
NEXT_PUBLIC_APP_URL=https://gast.grandhotellysekil.se
```

## Installation

```bash
npm install
npm run dev
```

## Deployment till Vercel

1. **Anslut GitHub-repot** i Vercel-dashboarden
2. **Lägg till domän**: `gast.grandhotellysekil.se`
3. **Sätt miljövariabler** i Vercel → Settings → Environment Variables
4. **Konfigurera DNS** hos Webbhotellsleverantören (CNAME → cname.vercel-dns.com)

## Sirvoy Webhook-konfiguration

I Sirvoy, gå till **Settings → Integrations → Webhooks**:

- **URL**: `https://gast.grandhotellysekil.se/api/webhook/booking`
- **Händelser**: Booking created, Booking modified
- **Secret header**: `x-webhook-secret` med samma värde som `SIRVOY_WEBHOOK_SECRET`

## Gästflöde

1. Gäst bokar rum i Sirvoy
2. Webhook skickar bokning till Zuve
3. Zuve sparar bokningen och genererar en unik token
4. SMS skickas till gästen med länk: `https://gast.grandhotellysekil.se/guest/<token>`
5. Gästen besöker sin personliga sida och kan:
   - Se bokningsdetaljer
   - Fyll i ankomsttid och önskemål
   - Lägga till tillval (frukost, blommor, etc.)
   - Utforska aktiviteter och restauranger i Lysekil

## Gruppincheckning

För företagsgrupper som checkar in många gäster samtidigt. Gästen skannar en
QR-kod, väljer sitt namn ur listan, fyller i e-post och telefon och får sitt
rumsnummer direkt. Ingen pappersblankett i receptionen.

**Sidor**

| Sida | Vem |
|---|---|
| `/incheckning/<slug>` | Gästen — namnlista, formulär, rumsnummer |
| `/incheckning/<slug>/flyer` | Utskrivbar A5-skylt med QR-koden |
| `/admin/incheckning/<slug>` | Receptionen — vilka som checkat in, Excel-export |

**Lägga upp en ny grupp**

1. Lägg till gruppen i `src/lib/group-checkin-data.ts` (deltagare, rum, datum).
   Slugen ligger i URL:en och ska vara ogissbar — lägg på några slumpmässiga
   tecken.
2. Deploya. Öppna `/incheckning/<slug>/flyer`, skriv ut och ställ i lobbyn.
3. Under incheckningen: håll `/admin/incheckning/<slug>` öppen i receptionen.
   Vyn uppdateras automatiskt var 15:e sekund.

**Minibarkort (Stripe)**

Gästen registrerar ett kort som garanti för minibaren. Kortet sparas hos Stripe
med en SetupIntent — inget debiteras vid incheckningen. Debiteringen görs manuellt
i Stripes dashboard vid utcheckning, eftersom någon ändå måste titta i minibaren.

Kräver `STRIPE_SECRET_KEY` i miljövariablerna. Saknas den är kortsteget avstängt
och incheckningen fungerar precis som vanligt.

Var kortsteget ligger styrs av `cardBeforeRoom` på gruppen:

- **`cardBeforeRoom: true`** — kortet krävs *före* rumsnumret. Gästen fyller i
  sina uppgifter, registrerar kortet hos Stripe och får rummet först på
  kvittosidan efteråt. Rumsnumret lämnar då aldrig servern i incheckningssvaret,
  så grinden går inte att kringgå via webbläsarens nätverksflik. Det finns
  ingen väg förbi och ingen "hoppa över"-knapp: kan gästen inte registrera ett
  kort löser receptionen både kort och nyckel manuellt. Avbryter gästen hos
  Stripe kommer hen tillbaka till kvittosidan med ett nytt försök — nyckeln
  följer med i adressen, rumsnumret gör det inte.
- **Utan fältet** — kortet ligger efter rumsnumret och är frivilligt. Krånglar
  kortet är gästen ändå incheckad och kan hämta sina nycklar.

Saknas Stripe-nyckeln stängs grinden av automatiskt, så att en grupp med
`cardBeforeRoom: true` inte fastnar i en återvändsgränd.

- Kortuppgifter passerar aldrig servern och lagras aldrig i Supabase. Vi sparar
  bara `stripe_customer_id`, `stripe_payment_method_id`, korttyp och fyra sista
  siffror. **Lägg aldrig till kolumner för kortnummer, CVC eller giltighetstid.**
- Villkoren gästen godkänner står i `src/lib/minibar-mandate.ts` och sparas
  ordagrant på raden tillsammans med tidpunkten. Ändrar du texten: höj
  `MINIBAR_MANDATE_VERSION` och skriv inte om gamla rader.
- Använd ett eget Stripe-konto, inte det Sirvoy administrerar — Stripe
  rekommenderar det själva i dashboarden.

**Att känna till**

- Sätt `secondNight` på en grupp som sträcker sig över flera nätter. Gästen
  måste då aktivt välja om hen stannar — ett uteblivet svar tolkas aldrig som
  "nej". Receptionens vy summerar hur många som stannar och räknar upp vilka
  rum som ska vändas, vilket också är avstämningen mot nästa dags lista.
- Saknar en person efternamn i deltagarlistan får hen fylla i sitt fullständiga
  namn vid incheckningen, och det är det namnet som sparas och visas för
  receptionen. Kravet räknas ut automatiskt: ett namn är ofullständigt om det
  bara har en del, eller om sista delen är en enda bokstav. Sätt
  `needsFullName: false` på en gäst som faktiskt bara har ett namn.
- Gästen fyller i företag/position, e-post, telefon och eventuella allergier.
  Vem gästen är väljs alltid ur listan och skrivs aldrig in fritt, eftersom det
  valet avgör vilket rum hen får — namnfältet ovan kompletterar bara stavningen.
- Gästen kan ange allergier eller specialkost när hen checkar in. Fältet är
  frivilligt. Receptionens vy visar alla allergier samlat högst upp, så att
  köket slipper leta i tabellen, och de följer med i Excel-exporten. Detta är
  hälsodata — använd det för måltiderna och spara det inte längre än nödvändigt.
- Rumsnumren skickas aldrig med i namnlistan. Ett rum avslöjas bara för den som
  just fyllt i sina uppgifter. Därför importeras `group-checkin-data.ts` bara av
  API-routes, aldrig av en klientkomponent.
- Använd den gästvänliga rumstypen i `roomType`, inte Sirvoys interna rumsnamn —
  de innehåller anteckningar som inte ska visas för gästen.
- Varje namn kan bara checkas in en gång. Om någon råkar välja fel namn frigör
  receptionen det med "Ta bort" i adminvyn.
- `/admin/incheckning/<slug>` har ingen inloggning, precis som `/admin/tavling`.
  Skyddet ligger i att slugen är ogissbar. Dela inte adminlänken utanför
  personalen.

## Redigera innehåll

Allt redigerbart innehåll (tillval, aktiviteter, restauranger) finns i:

```
src/lib/guest-data.ts
```

## Databas

Supabase-migration finns i:

```
supabase/migrations/001_init.sql
```

## Projektstruktur

```
src/
  app/
    page.tsx              # Landningssida
    guest/[token]/        # Gästens personliga sida
    api/
      webhook/booking/    # Sirvoy-webhook
      guest/[token]/      # Hämta/uppdatera gästdata
      extras/             # Spara tillval
  components/             # React-komponenter
  lib/
    guest-data.ts         # Redigerbart innehåll
    sms.ts                # 46elks-integration
    email.ts              # SMTP-integration
  types/
    booking.ts            # TypeScript-typer
```

---

Grand Hotel Lysekil · Strandvägen 1 · 453 30 Lysekil
