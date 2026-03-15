import { CheckInRepository } from "@/domain/repositories/check-in-repository";

/**
 * Confirma a conclusão do check-in da reserva selecionada.
 * Este caso de uso mantém a aplicação desacoplada da implementação concreta
 * que persiste a mudança de status da hospedagem.
 */
export class ConfirmCheckInUseCase {
  constructor(private readonly repository: CheckInRepository) {}

  // Encaminha a confirmação para a camada de infraestrutura responsável.
  async execute(reservationId: string) {
    return this.repository.confirmCheckIn(reservationId);
  }
}
