-- ============================================================
-- MIGRATION 011: Företag och position vid gruppincheckning
--
-- Vid företagsincheckningar vill receptionen veta vem personen är
-- i organisationen, inte bara namnet. Fältet fylls i av gästen och
-- är obligatoriskt, precis som e-post och telefon.
-- ============================================================

ALTER TABLE group_checkin_entries
  ADD COLUMN IF NOT EXISTS company_role TEXT;
