# Backend-setup — Grand Hotel Lysekil Gästapp

## Vad som behövs göras innan go-live

### 1. Supabase-databas (manuell setup i Supabase Dashboard)

#### Tabell: `rooms`
```sql
CREATE TABLE rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number   TEXT NOT NULL UNIQUE,
  room_type     TEXT NOT NULL,
  floor         INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO rooms (room_number, room_type, floor) VALUES
  ('201', 'Deluxe', 2), ('202', 'Deluxe', 2), ('203', 'Standard', 2),
  ('301', 'Suite', 3), ('302', 'Standard', 3);
```

#### Tabell: `bookings` (huvudtabell)
```sql
CREATE TABLE bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_booking_id   TEXT UNIQUE NOT NULL,
  sirvoy_property_id    TEXT,

  guest_first_name      TEXT NOT NULL,
  guest_last_name       TEXT NOT NULL,
  guest_email           TEXT,
  guest_phone           TEXT,
  guest_language        TEXT DEFAULT 'sv',

  check_in_date         DATE NOT NULL,
  check_out_date        DATE NOT NULL,
  number_of_guests      INTEGER NOT NULL DEFAULT 1,
  eta                   TEXT,
  notes                 TEXT,
  status                TEXT DEFAULT 'confirmed',
  cancelled             BOOLEAN DEFAULT FALSE,
  is_paid               BOOLEAN DEFAULT FALSE,
  booking_source        TEXT,

  total_price_sek       NUMERIC(10,2) NOT NULL,
  currency              TEXT DEFAULT 'SEK',

  sirvoy_room_name      TEXT,
  sirvoy_room_type      TEXT,
  room_id               UUID REFERENCES rooms(id) ON DELETE SET NULL,

  guest_token           UUID DEFAULT gen_random_uuid() UNIQUE,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_external_id ON bookings(external_booking_id);
CREATE INDEX idx_bookings_guest_token ON bookings(guest_token);
```

#### Tabell: `booking_extras` (gästens tillval)
```sql
CREATE TABLE booking_extras (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  extra_id        TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'SEK',
  quantity        INTEGER DEFAULT 1,
  status          TEXT DEFAULT 'requested',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_extras_booking ON booking_extras(booking_id);
```

#### Tabell: `payments` (Stripe-betalningar)
```sql
CREATE TABLE payments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id                UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_session_id         TEXT UNIQUE,
  stripe_payment_intent_id  TEXT,
  amount_sek                NUMERIC(10,2) NOT NULL,
  currency                  TEXT DEFAULT 'SEK',
  status                    TEXT DEFAULT 'pending',
  paid_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_session ON payments(stripe_session_id);
```

#### RLS (Row Level Security)
```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Server-anrop kan allt (webhooks, API)
CREATE POLICY "Server full access" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Server full access extras" ON booking_extras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Server full access payments" ON payments FOR ALL USING (true) WITH CHECK (true);
```

#### Trigger: auto-uppdatera updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

### 2. Miljövariabler (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ditt-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Sirvoy Webhook
WEBHOOK_SECRET=valfri-hemlig-nyckel

# 46elks SMS
ELKS_API_USERNAME=u...
ELKS_API_PASSWORD=...

# E-post (hotellets SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@grandhotellysekil.se
SMTP_PASS=app-specifikt-losenord
ADMIN_EMAIL=info@grandhotellysekil.se

# Stripe (läggs till sist)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App-URL (för länkar i SMS/e-post)
NEXT_PUBLIC_APP_URL=https://grandhotellysekil.se
```

---

### 3. Sirvoy-konfiguration

1. Gå till Sirvoy → Inställningar → Webhooks
2. URL: `https://grandhotellysekil.se/api/webhook/booking`
3. Header: `x-webhook-secret: valfri-hemlig-nyckel`
4. Events: `new`, `modified`, `deleted`

---

### 4. SMS (46elks) — hur det fungerar

Vid ny bokning:
1. Sirvoy skickar webhook
2. Vi sparar bokningen
3. Om `guest_phone` finns → skicka SMS via 46elks
4. Om telefon saknas → skicka e-post istället

SMS-text:
```
Hej [namn]! Välkommen till Grand Hotel Lysekil.
Se din bokning och tillval här:
https://grandhotellysekil.se/guest/[token]
```

---

### 5. OTA-bokningar (Booking.com / Expedia)

**Problemet:** Booking.com/Expedia skickar proxy-e-post (t.ex. `guest@booking.com`) i stället för gästens riktiga e-post. Telefonnummer är ofta dolt.

**Lösning:**
- I formuläret (steg 2) ber vi gästen komplettera sin **riktiga e-post** och **telefon**
- PATCH-uppdaterar bokningen med riktiga uppgifter
- När telefon finns → skicka SMS automatiskt (bakgrundstjänst)
- Sirvoy har redan en "digital check-in"-funktion som du nämnde — vi kan integrera med den

---

### 6. E-postnotifikationer till hotellet

| Händelse | Triggare |
|----------|----------|
| Nytt tillval bokat | Gäst klickar "Lägg till" i appen |
| Komplettering mottagen | Gäst sparar telefon/ETA/önskemål |
| Ny bokning (valfritt) | Sirvoy-webhook mottagen |

Mejl skickas via hotellets SMTP.

---

### 7. Stripe (sist, precis innan go-live)

1. Skapa Stripe-konto
2. Produkt: "Rumsbokning" med dynamiskt pris
3. Checkout-session skapas vid knapptryck
4. Webhook `/api/webhook/stripe` uppdaterar `is_paid = true`

---

## Nästa steg för dig

1. Kör SQL-migrationerna i Supabase SQL Editor
2. Fyll i `.env.local` med dina API-nycklar
3. Konfigurera Sirvoy-webhook
4. Jag bygger SMS + e-post + tillvalssparande
