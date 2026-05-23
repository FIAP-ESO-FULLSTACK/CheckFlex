import {
  CheckoutRepository,
  CheckoutResult,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";

/**
 * Conduz o check-out a partir dos dados informados pelo hóspede no totem.
 * Reusa a busca por identidade (código + CPF/nascimento) para validar quem
 * está finalizando a estadia antes de revogar credenciais.
 */
export class CheckoutUseCase {
  constructor(private readonly repository: CheckoutRepository) {}

  async execute(lookup: ReservationLookup): Promise<CheckoutResult> {
    const reservation = await this.repository.findReservation(lookup);

    if (!reservation) {
      throw new Error(
        "Reserva não encontrada ou dados não conferem. Revise os dados e tente novamente.",
      );
    }

    if (reservation.status === "reserved") {
      throw new Error(
        "Essa reserva ainda não fez check-in. Conclua o check-in antes do check-out.",
      );
    }

    if (reservation.status === "checked-out") {
      throw new Error("Essa reserva já foi finalizada anteriormente.");
    }

    return this.repository.checkout(reservation.id);
  }
}
