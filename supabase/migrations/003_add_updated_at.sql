-- ============================================================
-- Migration: Lägg till updated_at timestamp i bookings-tabellen
-- ============================================================
-- Uppdateras automatiskt via trigger varje gång en rad ändras

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger-funktion
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: sätt updated_at vid varje UPDATE
DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
