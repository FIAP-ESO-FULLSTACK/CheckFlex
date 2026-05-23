import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCheckInFlow } from "@/presentation/hooks/use-check-in-flow";
import {
  makeGuestAccess,
  makeReservation,
} from "@/test/factories/check-in-test-data";

const buildServices = (overrides: Partial<{
  findReservation: ReturnType<typeof vi.fn>;
  confirmCheckIn: ReturnType<typeof vi.fn>;
  issueGuestAccess: ReturnType<typeof vi.fn>;
}> = {}) => ({
  findReservation: { execute: overrides.findReservation ?? vi.fn() },
  confirmCheckIn: { execute: overrides.confirmCheckIn ?? vi.fn() },
  issueGuestAccess: { execute: overrides.issueGuestAccess ?? vi.fn() },
});

describe("useCheckInFlow", () => {
  it("avança da busca até a emissão de credenciais no fluxo feliz", async () => {
    const reservation = makeReservation();
    const confirmedReservation = makeReservation({ status: "checked-in" });
    const guestAccess = makeGuestAccess();
    const services = buildServices({
      findReservation: vi.fn().mockResolvedValue(reservation),
      confirmCheckIn: vi.fn().mockResolvedValue(confirmedReservation),
      issueGuestAccess: vi.fn().mockResolvedValue(guestAccess),
    });

    const { result } = renderHook(() => useCheckInFlow(() => services));

    act(() => {
      result.current.setLookupField("reservationCode", reservation.code);
      result.current.setLookupField("document", "123.456.789-09");
    });

    await act(async () => {
      await result.current.lookupReservation();
    });

    expect(result.current.stage).toBe("review");
    expect(services.findReservation.execute).toHaveBeenCalledWith({
      code: reservation.code,
      document: "123.456.789-09",
    });

    act(() => {
      result.current.setLookupField("phone", guestAccess.digitalKeyTarget);
      result.current.setAcceptedTerms(true);
    });

    await act(async () => {
      await result.current.issueGuestAccess();
    });

    await waitFor(() => {
      expect(result.current.stage).toBe("ready");
    });

    expect(result.current.access).toEqual(guestAccess);
    expect(result.current.reservation).toEqual(confirmedReservation);
    expect(services.confirmCheckIn.execute).toHaveBeenCalledWith(reservation.id);
    expect(services.issueGuestAccess.execute).toHaveBeenCalledWith({
      reservationId: reservation.id,
      phone: guestAccess.digitalKeyTarget,
      email: undefined,
    });
  });

  it("envia data de nascimento quando o hóspede é estrangeiro", async () => {
    const reservation = makeReservation();
    const services = buildServices({
      findReservation: vi.fn().mockResolvedValue(reservation),
    });

    const { result } = renderHook(() => useCheckInFlow(() => services));

    act(() => {
      result.current.setIdentityFactor("birthDate");
      result.current.setLookupField("reservationCode", reservation.code);
      result.current.setLookupField("birthDate", "22/05/1990");
    });

    await act(async () => {
      await result.current.lookupReservation();
    });

    expect(services.findReservation.execute).toHaveBeenCalledWith({
      code: reservation.code,
      birthDate: "22/05/1990",
    });
  });

  it("não envia o segundo fator quando o campo correspondente está vazio", async () => {
    const services = buildServices({
      findReservation: vi.fn().mockResolvedValue(null),
    });

    const { result } = renderHook(() => useCheckInFlow(() => services));

    act(() => {
      result.current.setLookupField("reservationCode", "CKF-5042");
    });

    await act(async () => {
      await result.current.lookupReservation();
    });

    expect(services.findReservation.execute).toHaveBeenCalledWith({
      code: "CKF-5042",
    });
  });

  it("bloqueia a emissão quando os termos não foram aceitos", async () => {
    const reservation = makeReservation();
    const services = buildServices({
      findReservation: vi.fn().mockResolvedValue(reservation),
    });

    const { result } = renderHook(() => useCheckInFlow(() => services));

    act(() => {
      result.current.setLookupField("reservationCode", reservation.code);
    });

    await act(async () => {
      await result.current.lookupReservation();
    });

    await act(async () => {
      await result.current.issueGuestAccess();
    });

    expect(result.current.stage).toBe("review");
    expect(result.current.error).toBe("errors.termsNotAccepted");
    expect(services.confirmCheckIn.execute).not.toHaveBeenCalled();
    expect(services.issueGuestAccess.execute).not.toHaveBeenCalled();
  });

  it("mantém o fluxo na etapa de busca quando a reserva falha", async () => {
    const services = buildServices({
      findReservation: vi
        .fn()
        .mockRejectedValue(
          new Error("Não foi possível encontrar a reserva informada."),
        ),
    });

    const { result } = renderHook(() => useCheckInFlow(() => services));

    act(() => {
      result.current.setLookupField("reservationCode", "ERRO-0001");
    });

    await act(async () => {
      await result.current.lookupReservation();
    });

    expect(result.current.stage).toBe("lookup");
    expect(result.current.reservation).toBeNull();
    expect(result.current.error).toBe(
      "Não foi possível encontrar a reserva informada.",
    );
  });
});
