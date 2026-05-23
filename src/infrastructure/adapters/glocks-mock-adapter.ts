import {
  KeyIssuanceAdapter,
  KeyIssuanceRequest,
} from "@/domain/ports/key-issuance-adapter";
import { GuestAccess } from "@/domain/entities/guest-access";

// Gera um PIN determinístico baseado no número do quarto. Mantemos previsível
// para apoiar a demonstração local — em produção seria aleatório.
const buildPin = (roomNumber: string) => {
  const base = Number(roomNumber);
  if (Number.isNaN(base)) {
    return "320000";
  }
  return String(320000 + base).padStart(6, "0");
};

/**
 * Adapter mock alinhado ao fluxo do app G-Locks Ébano 600 Smart Plus.
 * Substitui o SDK real e mantém a aplicação preparada para plugar a fechadura
 * verdadeira sem trocar use cases ou repositórios.
 */
export class GLocksMockAdapter implements KeyIssuanceAdapter {
  async issue(input: KeyIssuanceRequest): Promise<GuestAccess> {
    return {
      pin: buildPin(input.reservation.roomNumber),
      digitalKeyChannel: input.channel,
      digitalKeyTarget: input.target,
      roomNumber: input.reservation.roomNumber,
      roomLabel: input.reservation.roomLabel,
      expiresAt: input.reservation.checkOutDate,
      appProvider: "G-Locks",
    };
  }
}
