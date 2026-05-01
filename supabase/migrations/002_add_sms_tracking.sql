-- ============================================================
-- SUPABASE MIGRATION: Lägg till SMS-spårning och is_paid
-- ============================================================

-- Lägg till sms_sent_at för att undvika dubbla SMS
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMPTZ;

-- Lägg till is_paid (om den saknas)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_bookings_sms_sent ON bookings(sms_sent_at);
