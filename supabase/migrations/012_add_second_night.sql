-- ============================================================
-- MIGRATION 012: Stannar gästen ytterligare en natt?
--
-- För grupper som sträcker sig över flera nätter får gästen aktivt
-- välja om hen stannar. Utan det vet varken receptionen eller
-- städet vilka rum som ska vändas, och gäster som bor kvar riskerar
-- att tro att de måste checka in igen nästa dag.
--
-- NULL för grupper som inte ställer frågan.
-- ============================================================

ALTER TABLE group_checkin_entries
  ADD COLUMN IF NOT EXISTS second_night BOOLEAN;
