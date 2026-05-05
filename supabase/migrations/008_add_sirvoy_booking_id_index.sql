-- Add index on sirvoy_booking_id to support the /api/lookup endpoint efficiently.
-- Also adds a UNIQUE constraint since Sirvoy booking IDs are unique per property.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_sirvoy_booking_id ON bookings(sirvoy_booking_id);
