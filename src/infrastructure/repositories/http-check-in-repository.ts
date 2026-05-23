import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";
import {
  AccessRequest,
  CheckInRepository,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";

// Adapter consumido pela UI no navegador. Encaminha cada operação para a
// route handler correspondente do Next.js, mantendo o domínio fora do server.
export class HttpCheckInRepository implements CheckInRepository {
  constructor(private readonly baseUrl: string = "") {}

  async findReservation(input: ReservationLookup): Promise<Reservation | null> {
    const response = await fetch(`${this.baseUrl}/api/reservations/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Falha ao buscar reserva.");
    }

    const payload = (await response.json()) as { reservation: Reservation | null };
    return payload.reservation;
  }

  async confirmCheckIn(reservationId: string): Promise<Reservation> {
    const response = await fetch(`${this.baseUrl}/api/check-in/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId }),
    });

    const payload = (await response.json()) as
      | { reservation: Reservation }
      | { error: string };

    if (!response.ok) {
      throw new Error("error" in payload ? payload.error : "Falha ao confirmar check-in.");
    }

    return (payload as { reservation: Reservation }).reservation;
  }

  async issueGuestAccess(input: AccessRequest): Promise<GuestAccess> {
    const response = await fetch(`${this.baseUrl}/api/access/issue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as
      | { access: GuestAccess }
      | { error: string };

    if (!response.ok) {
      throw new Error("error" in payload ? payload.error : "Falha ao emitir credenciais.");
    }

    return (payload as { access: GuestAccess }).access;
  }

}
