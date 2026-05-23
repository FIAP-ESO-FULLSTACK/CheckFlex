import { describe, expect, it } from "vitest";
import { CheckoutUseCase } from "@/application/use-cases/checkout-use-case";
import {
  makeCheckoutRepositorySpy,
  makeReservation,
} from "@/test/factories/check-in-test-data";

describe("CheckoutUseCase", () => {
  it("revoga credenciais quando a reserva está em check-in", async () => {
    const repository = makeCheckoutRepositorySpy();
    const reservation = makeReservation({ status: "checked-in" });
    repository.findReservation.mockResolvedValue(reservation);
    repository.checkout.mockResolvedValue({
      reservation: { ...reservation, status: "checked-out" },
      revokedAccessCount: 1,
    });

    const useCase = new CheckoutUseCase(repository);
    const result = await useCase.execute({ code: reservation.code, document: "X" });

    expect(repository.checkout).toHaveBeenCalledWith(reservation.id);
    expect(result.revokedAccessCount).toBe(1);
    expect(result.reservation.status).toBe("checked-out");
  });

  it("rejeita reserva sem check-in concluído", async () => {
    const repository = makeCheckoutRepositorySpy();
    repository.findReservation.mockResolvedValue(makeReservation({ status: "reserved" }));

    const useCase = new CheckoutUseCase(repository);

    await expect(useCase.execute({ code: "CKF-5042" })).rejects.toThrow(
      /Conclua o check-in/,
    );
    expect(repository.checkout).not.toHaveBeenCalled();
  });

  it("rejeita reserva já finalizada", async () => {
    const repository = makeCheckoutRepositorySpy();
    repository.findReservation.mockResolvedValue(
      makeReservation({ status: "checked-out" }),
    );

    const useCase = new CheckoutUseCase(repository);

    await expect(useCase.execute({ code: "CKF-5042" })).rejects.toThrow(
      /já foi finalizada/,
    );
  });

  it("dá mensagem genérica quando a identidade não confere", async () => {
    const repository = makeCheckoutRepositorySpy();
    repository.findReservation.mockResolvedValue(null);

    const useCase = new CheckoutUseCase(repository);

    await expect(useCase.execute({ code: "X" })).rejects.toThrow(
      /não encontrada ou dados não conferem/,
    );
  });
});
