import { Reservation } from "@/domain/entities/reservation";
import { ReservationLookup } from "@/domain/repositories/check-in-repository";

/**
 * Porta que descreve o contrato com um PMS (Property Management System).
 * A aplicação fala com qualquer PMS através dessa interface; a implementação
 * local (`LocalPmsAdapter`) usa o próprio banco SQLite do projeto.
 */
export interface PmsAdapter {
  findReservation(input: ReservationLookup): Promise<Reservation | null>;
  confirmCheckIn(reservationId: string): Promise<Reservation>;
  closeStay(reservationId: string): Promise<Reservation>;
}
