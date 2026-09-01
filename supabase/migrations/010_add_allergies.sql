-- ============================================================
-- MIGRATION 010: Allergier vid gruppincheckning
--
-- Gästen kan ange allergier eller specialkost när hen checkar in,
-- så att köket har uppgiften utan att receptionen behöver fråga
-- var och en.
--
-- Fältet är frivilligt och NULL när gästen inte fyllt i något.
--
-- OBS: Uppgifter om allergier är hälsodata. De ska bara användas
-- för måltiderna under vistelsen och inte sparas längre än
-- nödvändigt.
-- ============================================================

ALTER TABLE group_checkin_entries
  ADD COLUMN IF NOT EXISTS allergies TEXT;
