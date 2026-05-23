import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";
import {
  AccessRequest,
  CheckInRepository,
  CheckoutRepository,
  CheckoutResult,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";

// Simula latência de rede para aproximar a experiência local do fluxo real.
const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Estrutura interna do mock guarda o segundo fator (CPF ou data de nascimento)
// usado na validação de identidade descrita em AGENTS.md.
interface MockReservation extends Reservation {
  guestDocument?: string;
  guestBirthDate?: string;
}

// Base de dados em memória usada na demonstração e nos fluxos locais sem API real.
const baseReservations: MockReservation[] = [
  {
    id: "res-504",
    code: "CKF-5042",
    propertyName: "Fiap Suítes",
    roomNumber: "504",
    roomLabel: "Suíte Horizonte",
    guestFullName: "Marina Alves",
    guestDocument: "12345678909",
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
    guestBirthDate: "1990-05-22",
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

const normalizeDocument = (value?: string | null) =>
  value ? value.replace(/\D/g, "") : null;

const normalizeBirthDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  return trimmed;
};

// Remove os campos privados ao retornar a entidade para a camada de domínio.
const toPublicReservation = ({
  guestDocument: _doc,
  guestBirthDate: _birth,
  ...reservation
}: MockReservation): Reservation => reservation;

/**
 * Implementação fake do repositório de check-in.
 * Mantém estado local em memória para permitir desenvolvimento, testes visuais
 * e validação da jornada sem depender de backend, PMS ou fechadura real.
 */
export class MockCheckInRepository
  implements CheckInRepository, CheckoutRepository
{
  private readonly reservations = new Map(
    baseReservations.map((reservation) => [reservation.id, { ...reservation }]),
  );

  async findReservation(input: ReservationLookup) {
    await delay(650);

    const normalizedCode = input.code.trim().toUpperCase();
    if (!normalizedCode) {
      return null;
    }

    const reservation = [...this.reservations.values()].find(
      (item) => item.code.toUpperCase() === normalizedCode,
    );

    if (!reservation) {
      return null;
    }

    const expectedDocument = normalizeDocument(reservation.guestDocument);
    const expectedBirth = normalizeBirthDate(reservation.guestBirthDate);
    const informedDocument = normalizeDocument(input.document);
    const informedBirth = normalizeBirthDate(input.birthDate);

    const matchesDocument =
      expectedDocument != null &&
      informedDocument != null &&
      expectedDocument === informedDocument;

    const matchesBirth =
      expectedBirth != null &&
      informedBirth != null &&
      expectedBirth === informedBirth;

    if (expectedDocument || expectedBirth) {
      if (!matchesDocument && !matchesBirth) {
        return null;
      }
    }

    return toPublicReservation({ ...reservation });
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

    const updatedReservation: MockReservation = {
      ...reservation,
      status: "checked-in",
    };

    this.reservations.set(reservationId, updatedReservation);

    return toPublicReservation({ ...updatedReservation });
  }

  async issueGuestAccess(input: AccessRequest) {
    await delay(700);

    const reservation = this.reservations.get(input.reservationId);

    if (!reservation) {
      throw new Error("Não foi possível localizar a reserva para emitir o acesso.");
    }

    const digitalKeyChannel = input.phone ? "phone" : "email";
    const digitalKeyTarget = input.phone ?? input.email ?? "";

    const notificationEmail = input.email?.trim() || null;

    const guestAccess: GuestAccess = {
      pin: buildPin(reservation.roomNumber),
      digitalKeyChannel,
      digitalKeyTarget,
      notificationEmail,
      roomNumber: reservation.roomNumber,
      roomLabel: reservation.roomLabel,
      expiresAt: reservation.checkOutDate,
      appProvider: "G-Locks",
    };

    this.activeAccesses.set(reservation.id, guestAccess);
    return guestAccess;
  }

  async checkout(reservationId: string): Promise<CheckoutResult> {
    await delay(500);

    const reservation = this.reservations.get(reservationId);
    if (!reservation) {
      throw new Error("Reserva não encontrada para check-out.");
    }
    if (reservation.status === "checked-out") {
      throw new Error("Essa reserva já foi finalizada.");
    }
    if (reservation.status !== "checked-in") {
      throw new Error("O check-out só pode ser feito após o check-in.");
    }

    const updated: MockReservation = {
      ...reservation,
      status: "checked-out",
    };
    this.reservations.set(reservationId, updated);

    const revokedAccess = this.activeAccesses.get(reservationId) ?? null;
    const hadAccess = this.activeAccesses.delete(reservationId);
    return {
      reservation: toPublicReservation({ ...updated }),
      revokedAccessCount: hadAccess ? 1 : 0,
      revokedAccess,
    };
  }

  async revokeExpiredAccesses(referenceTime: string): Promise<number> {
    let revoked = 0;
    for (const [id, reservation] of this.reservations) {
      if (
        reservation.status === "checked-in" &&
        reservation.checkOutDate < referenceTime &&
        this.activeAccesses.has(id)
      ) {
        this.activeAccesses.delete(id);
        this.reservations.set(id, { ...reservation, status: "checked-out" });
        revoked += 1;
      }
    }
    return revoked;
  }

  // Mantém referência das credenciais emitidas para simular revogação no checkout.
  private readonly activeAccesses = new Map<string, GuestAccess>();
}
