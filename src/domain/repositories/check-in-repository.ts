import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";

/**
 * Dados mínimos para localizar uma reserva no início da jornada.
 * O segundo fator é o CPF do titular ou, para hóspedes estrangeiros sem CPF,
 * a data de nascimento registrada no PMS (decisão registrada em AGENTS.md).
 */
export interface ReservationLookup {
  code: string;
  document?: string;
  birthDate?: string;
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
 * Resultado do check-out: reserva atualizada, quantidade de credenciais
 * revogadas e (opcionalmente) a credencial mais recente para que a UI
 * possa apresentar o PIN/e-mail durante a confirmação visual do check-out.
 */
export interface CheckoutResult {
  reservation: Reservation;
  revokedAccessCount: number;
  revokedAccess?: GuestAccess | null;
}

/**
 * Contrato consumido pelo fluxo de check-in. Pequeno de propósito: a UI no
 * navegador implementa apenas o que precisa para falar com a API.
 */
export interface CheckInRepository {
  findReservation(input: ReservationLookup): Promise<Reservation | null>;
  confirmCheckIn(reservationId: string): Promise<Reservation>;
  issueGuestAccess(input: AccessRequest): Promise<GuestAccess>;
}

/**
 * Contrato consumido pelo fluxo de check-out. Vive separado para que adapters
 * que só atuam no servidor implementem revogação sem afetar o adapter HTTP.
 */
export interface CheckoutRepository {
  findReservation(input: ReservationLookup): Promise<Reservation | null>;
  checkout(reservationId: string): Promise<CheckoutResult>;
  revokeExpiredAccesses(referenceTime: string): Promise<number>;
}
