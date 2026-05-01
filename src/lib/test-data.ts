import type { Booking, ApiResponse } from "@/types/booking";

export const testBooking: Booking = {
  guest_first_name: "Erik",
  guest_last_name: "Svensson",
  guest_email: null,
  guest_phone: null,
  check_in_date: "2026-07-01",
  check_out_date: "2026-07-03",
  number_of_guests: 2,
  eta: "",
  status: "confirmed",
  notes: "",
  total_price_sek: 2640,
  currency: "SEK",
  sirvoy_room_name: "201",
  sirvoy_room_type: "Deluxe",
  is_paid: false,
  rooms: {
    room_number: "201",
    room_type: "Deluxe",
    floor: 2,
  },
};

export const testApiResponse: ApiResponse = {
  booking: testBooking,
};
