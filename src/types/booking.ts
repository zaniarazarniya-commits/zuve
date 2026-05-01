export interface Room {
  room_number: string;
  room_type: string;
  floor: number;
}

export interface Booking {
  guest_first_name: string;
  guest_last_name: string;
  guest_email?: string | null;
  guest_phone?: string | null;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  eta: string;
  status: string;
  notes: string;
  total_price_sek: number;
  currency: string;
  sirvoy_room_name: string;
  sirvoy_room_type: string;
  rooms: Room;
  is_paid?: boolean;
}

export interface ApiResponse {
  booking: Booking;
}
