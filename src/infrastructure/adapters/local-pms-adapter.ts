import { Reservation } from "@/domain/entities/reservation";
import { PmsAdapter } from "@/domain/ports/pms-adapter";
import { ReservationLookup } from "@/domain/repositories/check-in-repository";
import { SqliteCheckInRepository } from "@/infrastructure/repositories/sqlite-check-in-repository";

/**
 * Implementação local da porta PMS: usa o próprio SQLite do projeto para
 * simular as operações que um PMS real exporia. Documenta o seam onde a
 * integração com Opera, Cloudbeds, HiTS, etc. pode ser plugada.
 */
export class LocalPmsAdapter implements PmsAdapter {
  constructor(private readonly repository: SqliteCheckInRepository) {}

  findReservation(input: ReservationLookup): Promise<Reservation | null> {
    return this.repository.findReservation(input);
  }

  confirmCheckIn(reservationId: string): Promise<Reservation> {
    return this.repository.confirmCheckIn(reservationId);
  }

  async closeStay(reservationId: string): Promise<Reservation> {
    const result = await this.repository.checkout(reservationId);
    return result.reservation;
  }
}
