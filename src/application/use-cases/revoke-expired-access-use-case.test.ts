import { describe, expect, it, vi } from "vitest";
import { RevokeExpiredAccessUseCase } from "@/application/use-cases/revoke-expired-access-use-case";
import { makeCheckoutRepositorySpy } from "@/test/factories/check-in-test-data";

describe("RevokeExpiredAccessUseCase", () => {
  it("repassa o instante atual ao repositório e retorna o total revogado", async () => {
    const repository = makeCheckoutRepositorySpy();
    repository.revokeExpiredAccesses.mockResolvedValue(2);

    const useCase = new RevokeExpiredAccessUseCase(repository);
    const fixedNow = new Date("2026-03-20T12:00:00.000Z");
    const total = await useCase.execute(fixedNow);

    expect(total).toBe(2);
    expect(repository.revokeExpiredAccesses).toHaveBeenCalledWith(
      fixedNow.toISOString(),
    );
  });

  it("usa o relógio atual quando nenhuma referência é passada", async () => {
    const repository = makeCheckoutRepositorySpy();
    repository.revokeExpiredAccesses.mockResolvedValue(0);

    const useCase = new RevokeExpiredAccessUseCase(repository);
    const before = Date.now();
    await useCase.execute();
    const callArg = repository.revokeExpiredAccesses.mock.calls[0]?.[0] as string;

    expect(typeof callArg).toBe("string");
    expect(new Date(callArg).getTime()).toBeGreaterThanOrEqual(before);
    expect(vi.isMockFunction(repository.revokeExpiredAccesses)).toBe(true);
  });
});
