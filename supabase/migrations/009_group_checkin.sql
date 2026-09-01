-- ============================================================
-- MIGRATION 009: Gruppincheckning
--
-- Företagsgrupper som checkar in många gäster samtidigt skannar
-- en QR-kod, väljer sitt namn ur listan och fyller i e-post och
-- telefon. Då får de sitt rumsnummer och receptionen slipper
-- pappersblanketter.
--
-- Deltagarlistan (namn + rumsfördelning) ligger i koden,
-- src/lib/group-checkin-data.ts. Här sparas bara det gästen
-- själv fyller i.
-- ============================================================

CREATE TABLE IF NOT EXISTS group_checkin_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vilken grupp (slug från group-checkin-data.ts)
  group_slug    TEXT NOT NULL,
  -- Vilken person i gruppen (key från group-checkin-data.ts)
  guest_key     TEXT NOT NULL,

  -- Kopieras hit vid incheckning så att receptionens vy och
  -- Excel-exporten fungerar även om listan i koden ändras efteråt.
  guest_name    TEXT NOT NULL,
  room_number   TEXT NOT NULL,

  -- Det gästen fyller i
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,

  created_at    TIMESTAMPTZ DEFAULT NOW(),

  -- En person kan bara checka in en gång. Receptionen kan frigöra
  -- ett namn genom att ta bort raden i adminvyn.
  CONSTRAINT group_checkin_unique_guest UNIQUE (group_slug, guest_key)
);

CREATE INDEX IF NOT EXISTS idx_group_checkin_slug
  ON group_checkin_entries(group_slug);

-- ============================================================
-- RLS — samma mönster som övriga tabeller: all åtkomst går via
-- servern med service role-nyckeln, aldrig direkt från webbläsaren.
-- ============================================================
ALTER TABLE group_checkin_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Server full access group_checkin" ON group_checkin_entries;
CREATE POLICY "Server full access group_checkin"
  ON group_checkin_entries FOR ALL USING (true) WITH CHECK (true);
