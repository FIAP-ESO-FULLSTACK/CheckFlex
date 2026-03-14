import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";
import {
  AccessRequest,
  CheckInRepository,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const baseReservations: Reservation[] = [
  {
    id: "res-504",
    code: "CKF-5042",
    propertyName: "Fiap Suítes",
    roomNumber: "504",
    roomLabel: "Suíte Horizonte",
    guestFullName: "Marina Alves",
    checkInDate: "2026-03-14T14:00:00.000Z",
    checkOutDate: "2026-03-17T12:00:00.000Z",
    nights: 3,
    status: "reserved",
  },
  {
    id: "res-212",
    code: "CKF-2128",
    propertyName: "Fiap Suítes",
    roomNumber: "212",
    roomLabel: "Quarto Jardim",
    guestFullName: "Rafael Costa",
    checkInDate: "2026-03-14T14:00:00.000Z",
    checkOutDate: "2026-03-15T12:00:00.000Z",
    nights: 1,
    status: "reserved",
  },
];

export const mockReservationCodeExamples = baseReservations.map(
  (reservation) => reservation.code,
);

const buildPin = (roomNumber: string) => {
  const base = Number(roomNumber);
  return String(320000 + base).padStart(6, "0");
};

export class MockCheckInRepository implements CheckInRepository {
  // Mantém estado em memória para simular a evolução da reserva dentro do fluxo.
  private readonly reservations = new Map(
    baseReservations.map((reservation) => [reservation.id, { ...reservation }]),
  );

  async findReservation(input: ReservationLookup) {
    await delay(650);

    const normalizedCode = input.code.trim().toUpperCase();

    const reservation =
      [...this.reservations.values()].find(
        (item) => item.code.toUpperCase() === normalizedCode,
      ) ?? null;

    return reservation ? { ...reservation } : null;
  }

  async confirmCheckIn(reservationId: string) {
    await delay(500);

    const reservation = this.reservations.get(reservationId);

    if (!reservation) {
      throw new Error("Reserva não encontrada para confirmação.");
    }

    if (reservation.status === "checked-in") {
      throw new Error("Essa reserva já está em check-in concluído.");
    }

    const updatedReservation: Reservation = {
      ...reservation,
      status: "checked-in",
    };

    this.reservations.set(reservationId, updatedReservation);

    return { ...updatedReservation };
  }

  async issueGuestAccess(input: AccessRequest) {
    await delay(700);

    const reservation = this.reservations.get(input.reservationId);

    if (!reservation) {
      throw new Error("Não foi possível localizar a reserva para emitir o acesso.");
    }

    const digitalKeyChannel = input.phone ? "phone" : "email";
    const digitalKeyTarget = input.phone ?? input.email ?? "";

    const guestAccess: GuestAccess = {
      pin: buildPin(reservation.roomNumber),
      digitalKeyChannel,
      digitalKeyTarget,
      roomNumber: reservation.roomNumber,
      roomLabel: reservation.roomLabel,
      expiresAt: reservation.checkOutDate,
      appProvider: "G-Locks",
    };

    return guestAccess;
  }
}
