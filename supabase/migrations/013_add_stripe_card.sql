-- ============================================================
-- MIGRATION 013: Sparat kort för minibar
--
-- Gästen kan registrera ett kort som garanti för minibaren.
-- Kortet sparas hos Stripe, aldrig här. Kolumnerna nedan är bara
-- referenser plus det som behövs för att receptionen ska känna
-- igen kortet i listan.
--
-- ⚠️ Lägg ALDRIG till kolumner för kortnummer, CVC eller
-- giltighetstid. Det kräver PCI DSS-efterlevnad på tyngsta nivån
-- och adminvyn har ingen inloggning.
-- ============================================================

ALTER TABLE group_checkin_entries
  -- Stripe-kunden, t.ex. "cus_..." — sökbar i Stripes dashboard
  ADD COLUMN IF NOT EXISTS stripe_customer_id       TEXT,
  -- Den sparade betalmetoden, t.ex. "pm_..."
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
  -- Bara för igenkänning i receptionen: "visa", "4242"
  ADD COLUMN IF NOT EXISTS card_brand               TEXT,
  ADD COLUMN IF NOT EXISTS card_last4               TEXT,
  -- När gästen godkände villkoren, och exakt vilken text som visades
  ADD COLUMN IF NOT EXISTS card_mandate_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS card_mandate_text        TEXT,
  ADD COLUMN IF NOT EXISTS card_mandate_version     TEXT;

CREATE INDEX IF NOT EXISTS idx_group_checkin_stripe_customer
  ON group_checkin_entries(stripe_customer_id);
