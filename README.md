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
