import { CheckoutRepository } from "@/domain/repositories/check-in-repository";

/**
 * Sweeper que revoga credenciais cuja estadia já terminou.
 * Chamado periodicamente pelo agendador interno para fechar o gap da
 * revogação automática descrito no README do MVP.
 */
export class RevokeExpiredAccessUseCase {
  constructor(private readonly repository: CheckoutRepository) {}

  async execute(now: Date = new Date()): Promise<number> {
    return this.repository.revokeExpiredAccesses(now.toISOString());
  }
}
