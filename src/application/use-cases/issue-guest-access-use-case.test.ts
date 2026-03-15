import { describe, expect, it } from "vitest";
import { IssueGuestAccessUseCase } from "@/application/use-cases/issue-guest-access-use-case";
import {
  makeCheckInRepositorySpy,
  makeGuestAccess,
} from "@/test/factories/check-in-test-data";

// Garante a validação do canal de entrega e a delegação da emissão do acesso.
describe("IssueGuestAccessUseCase", () => {
  it("exige telefone ou e-mail antes de emitir a chave digital", async () => {
    const repository = makeCheckInRepositorySpy();
    const useCase = new IssueGuestAccessUseCase(repository);

    await expect(
      useCase.execute({
        reservationId: "res-504",
      }),
    ).rejects.toThrow(
      "Informe pelo menos um telefone ou e-mail para entregar a chave digital ao hóspede.",
    );

    expect(repository.issueGuestAccess).not.toHaveBeenCalled();
  });

  it("delega a emissão quando há canal de contato informado", async () => {
    const repository = makeCheckInRepositorySpy();
    const guestAccess = makeGuestAccess();

    repository.issueGuestAccess.mockResolvedValue(guestAccess);

    const useCase = new IssueGuestAccessUseCase(repository);

    await expect(
      useCase.execute({
        reservationId: "res-504",
        phone: "+5511999999999",
      }),
    ).resolves.toEqual(guestAccess);
  });
});
