-- ============================================================
-- Migration: Lägg till sms_completion_sent_at för att spåra
-- att completion-SMS skickats (när gästen kompletterar nummer)
-- ============================================================

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS sms_completion_sent_at TIMESTAMPTZ;
