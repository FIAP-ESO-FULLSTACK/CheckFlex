import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCheckoutFlow } from "@/presentation/hooks/use-checkout-flow";
import { makeReservation } from "@/test/factories/check-in-test-data";

const buildService = (impl: ReturnType<typeof vi.fn>) => ({ execute: impl });

describe("useCheckoutFlow", () => {
  it("envia o segundo fator (CPF) e expõe o resultado bem-sucedido", async () => {
    const reservation = makeReservation({ status: "checked-out" });
    const execute = vi
      .fn()
      .mockResolvedValue({ reservation, revokedAccessCount: 1 });

    const { result } = renderHook(() => useCheckoutFlow(buildService(execute)));

    act(() => {
      result.current.setLookupField("reservationCode", "CKF-5042");
      result.current.setLookupField("document", "123.456.789-09");
    });

    await act(async () => {
      await result.current.runCheckout();
    });

    await waitFor(() => {
      expect(result.current.result).not.toBeNull();
    });

    expect(execute).toHaveBeenCalledWith({
      code: "CKF-5042",
      document: "123.456.789-09",
    });
    expect(result.current.result?.revokedAccessCount).toBe(1);
  });

  it("envia data de nascimento para hóspede estrangeiro", async () => {
    const execute = vi
      .fn()
      .mockResolvedValue({ reservation: makeReservation(), revokedAccessCount: 0 });

    const { result } = renderHook(() => useCheckoutFlow(buildService(execute)));

    act(() => {
      result.current.setIdentityFactor("birthDate");
      result.current.setLookupField("reservationCode", "CKF-2128");
      result.current.setLookupField("birthDate", "22/05/1990");
    });

    await act(async () => {
      await result.current.runCheckout();
    });

    expect(execute).toHaveBeenCalledWith({
      code: "CKF-2128",
      birthDate: "22/05/1990",
    });
  });

  it("guarda a mensagem de erro quando o serviço falha", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("Reserva não encontrada."));

    const { result } = renderHook(() => useCheckoutFlow(buildService(execute)));

    act(() => {
      result.current.setLookupField("reservationCode", "X");
    });

    await act(async () => {
      await result.current.runCheckout();
    });

    expect(result.current.error).toBe("Reserva não encontrada.");
    expect(result.current.result).toBeNull();
  });
});
