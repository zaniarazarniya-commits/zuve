-- ============================================================
-- SUPABASE MIGRATION: Initiera databasen för Grand Hotel Lysekil
-- ============================================================

-- 1. RUM
CREATE TABLE IF NOT EXISTS rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number   TEXT NOT NULL UNIQUE,
  room_type     TEXT NOT NULL,
  floor         INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BOKNINGAR
CREATE TABLE IF NOT EXISTS bookings (
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

  total_price_sek       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency              TEXT DEFAULT 'SEK',

  sirvoy_room_name      TEXT,
  sirvoy_room_type      TEXT,
  room_id               UUID REFERENCES rooms(id) ON DELETE SET NULL,

  guest_token           UUID DEFAULT gen_random_uuid() UNIQUE,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_external_id ON bookings(external_booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_token ON bookings(guest_token);

-- 3. TILLVAL (booking_extras)
CREATE TABLE IF NOT EXISTS booking_extras (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  extra_id        TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency        TEXT DEFAULT 'SEK',
  quantity        INTEGER DEFAULT 1,
  status          TEXT DEFAULT 'requested',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extras_booking ON booking_extras(booking_id);

-- 4. RLS (Row Level Security)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Ta bort gamla policies om de finns (för att kunna köra om)
DROP POLICY IF EXISTS "Server full access bookings" ON bookings;
DROP POLICY IF EXISTS "Server full access extras" ON booking_extras;
DROP POLICY IF EXISTS "Server full access rooms" ON rooms;

CREATE POLICY "Server full access bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Server full access extras" ON booking_extras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Server full access rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);

-- 5. TRIGGER: Uppdatera updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. SEED: Lägg in alla rum från Sirvoy
INSERT INTO rooms (room_number, room_type, floor) VALUES
  ('110', 'Familjerum', 1),
  ('111', 'Small Dubbel', 1),
  ('112', 'Small Dubbel', 1),
  ('113', 'Dog Room', 1),
  ('201', 'Single', 2),
  ('202', 'Normal Dubbel', 2),
  ('203', 'Normal Dubbel', 2),
  ('204', 'Normal Dubbel', 2),
  ('205', 'Small Dubbel', 2),
  ('206', 'Single', 2),
  ('207', 'Twin', 2),
  ('210', 'Single', 2),
  ('211', 'Small Dubbel', 2),
  ('212', 'Small Dubbel', 2),
  ('213', 'Litet Familjerum', 2),
  ('302', 'Double Sea View', 3),
  ('303', 'Normal Dubbel', 3),
  ('304', 'Double or Twin', 3),
  ('305', 'Small Dubbel', 3),
  ('306', 'Normal Dubbel', 3),
  ('307', 'Familjerum', 3),
  ('400', 'GH Apartment', 4),
  ('500', 'Suite MB', 5),
  ('Attic 1', 'Nödutgång', 5),
  ('Attic 2', 'Double', 5),
  ('Attic 3', 'Single', 5),
  ('Chamber 1', 'Konferensrum', 0),
  ('Chamber 2', 'Konferensrum', 0)
ON CONFLICT (room_number) DO NOTHING;
