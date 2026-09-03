-- ============================================================
-- MIGRATION 014: Receptionens anteckning + manuell incheckning
--
-- Alla gäster checkar inte in via QR-koden. Någon kommer fram till
-- disken direkt, och då gör receptionen incheckningen åt hen. Två
-- saker behövs för det:
--
--   staff_note  — varför raden ser ut som den gör. Framför allt
--                 "minibar faktureras", när gästen inte lämnat kort
--                 utan notan går till företaget.
--
--   e-post och telefon får vara tomma. Gästen som checkas in i
--   disken har inte alltid lämnat dem, och en tom ruta är ärligare
--   än ett påhittat nummer. Gästens eget formulär kräver dem
--   fortfarande — den valideringen ligger i API:et.
-- ============================================================

ALTER TABLE group_checkin_entries
  ADD COLUMN IF NOT EXISTS staff_note TEXT;

ALTER TABLE group_checkin_entries
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL;
