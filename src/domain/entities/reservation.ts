export type ReservationStatus = "reserved" | "checked-in";

export interface Reservation {
  id: string;
  code: string;
  propertyName: string;
  roomNumber: string;
  roomLabel: string;
  guestFullName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  status: ReservationStatus;
}
