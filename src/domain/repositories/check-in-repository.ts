import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";

/**
 * Dados mínimos para localizar uma reserva no início da jornada.
 */
export interface ReservationLookup {
  code: string;
}

/**
 * Dados necessários para emitir o acesso do hóspede após a confirmação
 * do check-in. Pelo menos um canal de entrega deve ser informado.
 */
export interface AccessRequest {
  reservationId: string;
  phone?: string;
  email?: string;
}

/**
 * Contrato de acesso aos dados e serviços externos do fluxo de check-in.
 * A aplicação depende desta abstração para buscar reservas, confirmar a
 * hospedagem e emitir as credenciais sem conhecer a implementação concreta.
 */
export interface CheckInRepository {
  /**
   * Localiza a reserva correspondente ao código informado.
   */
  findReservation(input: ReservationLookup): Promise<Reservation | null>;

  /**
   * Marca a reserva como check-in concluído.
   */
  confirmCheckIn(reservationId: string): Promise<Reservation>;

  /**
   * Emite a credencial temporária que será entregue ao hóspede.
   */
  issueGuestAccess(input: AccessRequest): Promise<GuestAccess>;
}
