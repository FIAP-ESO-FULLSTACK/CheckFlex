import {
  CheckInRepository,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";

/**
 * Localiza a reserva usada para iniciar o autoatendimento.
 * Também traduz a ausência de resultado para uma mensagem amigável à interface.
 */
export class FindReservationUseCase {
  constructor(private readonly repository: CheckInRepository) {}

  // Busca a reserva pelo código informado e normaliza a falha de localização.
  async execute(input: ReservationLookup) {
    const reservation = await this.repository.findReservation(input);

    if (!reservation) {
      // Mensagem genérica para não revelar se foi o código ou o segundo fator
      // que divergiu, conforme decisão registrada em AGENTS.md (US 5).
      throw new Error(
        "Reserva não encontrada ou dados não conferem. Revise os dados e tente novamente.",
      );
    }

    return reservation;
  }
}
