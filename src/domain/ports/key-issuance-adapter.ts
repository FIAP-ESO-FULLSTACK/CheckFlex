import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";

/**
 * Entrada esperada por adapters de emissão de chaves.
 * Carrega os campos necessários para a chave digital sem expor a reserva
 * inteira ao integrador.
 */
export interface KeyIssuanceRequest {
  reservation: Reservation;
  channel: "phone" | "email";
  target: string;
}

/**
 * Porta para adapters que falam com fechaduras e apps de chave digital.
 * O MVP usa um mock alinhado ao app da G-Locks. Outras fechaduras podem ser
 * adicionadas implementando este contrato.
 */
export interface KeyIssuanceAdapter {
  issue(input: KeyIssuanceRequest): Promise<GuestAccess>;
}
