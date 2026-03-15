import {
  AccessRequest,
  CheckInRepository,
} from "@/domain/repositories/check-in-repository";

/**
 * Emite a credencial temporária do hóspede após a confirmação do check-in.
 * Antes de delegar para a infraestrutura, garante que exista ao menos um
 * canal para entrega da chave digital.
 */
export class IssueGuestAccessUseCase {
  constructor(private readonly repository: CheckInRepository) {}

  // Valida os dados mínimos de contato e encaminha a emissão ao repositório.
  async execute(input: AccessRequest) {
    if (!input.phone && !input.email) {
      throw new Error(
        "Informe pelo menos um telefone ou e-mail para entregar a chave digital ao hóspede.",
      );
    }

    return this.repository.issueGuestAccess(input);
  }
}
