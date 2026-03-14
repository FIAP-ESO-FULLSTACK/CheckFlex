import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";
import {
  AccessRequest,
  CheckInRepository,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";

// Simula latência de rede para aproximar a experiência local do fluxo real.
const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Base de dados em memória usada na demonstração e nos fluxos locais sem API real.
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

// Lista de códigos exposta à UI para orientar a demonstração do fluxo.
export const mockReservationCodeExamples = baseReservations.map(
  (reservation) => reservation.code,
);

// Gera um PIN previsível por quarto apenas para fins de demonstração.
const buildPin = (roomNumber: string) => {
  const base = Number(roomNumber);
  return String(320000 + base).padStart(6, "0");
};

/**
 * Implementação fake do repositório de check-in.
 * Mantém estado local em memória para permitir desenvolvimento, testes visuais
 * e validação da jornada sem depender de backend, PMS ou fechadura real.
 */
export class MockCheckInRepository implements CheckInRepository {
  // Mantém estado em memória para simular a evolução da reserva dentro do fluxo.
  private readonly reservations = new Map(
    baseReservations.map((reservation) => [reservation.id, { ...reservation }]),
  );

  // Busca a reserva pelo código digitado no totem.
  async findReservation(input: ReservationLookup) {
    await delay(650);

    const normalizedCode = input.code.trim().toUpperCase();

    const reservation =
      [...this.reservations.values()].find(
        (item) => item.code.toUpperCase() === normalizedCode,
      ) ?? null;

    return reservation ? { ...reservation } : null;
  }

  // Atualiza o status da reserva para refletir a conclusão do check-in.
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

  // Emite uma credencial temporária com PIN e destino da chave digital.
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
