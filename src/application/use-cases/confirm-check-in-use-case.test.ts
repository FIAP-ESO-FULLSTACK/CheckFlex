import { describe, expect, it } from "vitest";
import { ConfirmCheckInUseCase } from "@/application/use-cases/confirm-check-in-use-case";
import {
  makeCheckInRepositorySpy,
  makeReservation,
} from "@/test/factories/check-in-test-data";

// Garante que o caso de uso preserve a delegação simples para o repositório.
describe("ConfirmCheckInUseCase", () => {
  it("delega a confirmação de check-in ao repositório", async () => {
    const repository = makeCheckInRepositorySpy();
    const reservation = makeReservation({ status: "checked-in" });

    repository.confirmCheckIn.mockResolvedValue(reservation);

    const useCase = new ConfirmCheckInUseCase(repository);

    await expect(useCase.execute(reservation.id)).resolves.toEqual(reservation);
    expect(repository.confirmCheckIn).toHaveBeenCalledWith(reservation.id);
  });
});
