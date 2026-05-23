import { describe, expect, it } from "vitest";
import { FindReservationUseCase } from "@/application/use-cases/find-reservation-use-case";
import {
  makeCheckInRepositorySpy,
  makeReservation,
} from "@/test/factories/check-in-test-data";

// Garante o comportamento esperado da busca e a mensagem exibida em caso de falha.
describe("FindReservationUseCase", () => {
  it("retorna a reserva quando o repositório encontra correspondência", async () => {
    const repository = makeCheckInRepositorySpy();
    const reservation = makeReservation();

    repository.findReservation.mockResolvedValue(reservation);

    const useCase = new FindReservationUseCase(repository);

    await expect(useCase.execute({ code: "CKF-5042" })).resolves.toEqual(
      reservation,
    );
  });

  it("lança erro amigável quando a reserva não existe", async () => {
    const repository = makeCheckInRepositorySpy();

    repository.findReservation.mockResolvedValue(null);

    const useCase = new FindReservationUseCase(repository);

    await expect(useCase.execute({ code: "INVALIDA" })).rejects.toThrow(
      "Reserva não encontrada ou dados não conferem. Revise os dados e tente novamente.",
    );
  });
});
