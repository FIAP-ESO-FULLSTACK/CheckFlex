import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCheckInFlow } from "@/presentation/hooks/use-check-in-flow";
import {
  makeGuestAccess,
  makeReservation,
} from "@/test/factories/check-in-test-data";

// Valida as transições de estado do hook que coordena a jornada do hóspede.
describe("useCheckInFlow", () => {
  it("avança da busca até a emissão de credenciais no fluxo feliz", async () => {
    const reservation = makeReservation();
    const confirmedReservation = makeReservation({ status: "checked-in" });
    const guestAccess = makeGuestAccess();
    const services = {
      findReservation: {
        execute: vi.fn().mockResolvedValue(reservation),
      },
      confirmCheckIn: {
        execute: vi.fn().mockResolvedValue(confirmedReservation),
      },
      issueGuestAccess: {
        execute: vi.fn().mockResolvedValue(guestAccess),
      },
    };

    const { result } = renderHook(() => useCheckInFlow(() => services));

    // Inicia a jornada com a busca da reserva pelo código.
    act(() => {
      result.current.setLookupField("reservationCode", reservation.code);
    });

    await act(async () => {
      await result.current.lookupReservation();
    });

    expect(result.current.stage).toBe("review");
    expect(result.current.reservation).toEqual(reservation);

    act(() => {
      result.current.setLookupField("phone", guestAccess.digitalKeyTarget);
      result.current.setAcceptedTerms(true);
    });

    // Finaliza o fluxo feliz com confirmação e emissão do acesso.
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

  it("bloqueia a emissão quando os termos não foram aceitos", async () => {
    const reservation = makeReservation();
    const services = {
      findReservation: {
        execute: vi.fn().mockResolvedValue(reservation),
      },
      confirmCheckIn: {
        execute: vi.fn(),
      },
      issueGuestAccess: {
        execute: vi.fn(),
      },
    };

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
    expect(result.current.error).toBe(
      "Confirme os termos operacionais antes de concluir o check-in.",
    );
    expect(services.confirmCheckIn.execute).not.toHaveBeenCalled();
    expect(services.issueGuestAccess.execute).not.toHaveBeenCalled();
  });

  it("mantém o fluxo na etapa de busca quando a reserva falha", async () => {
    const services = {
      findReservation: {
        execute: vi
          .fn()
          .mockRejectedValue(
            new Error("Não foi possível encontrar a reserva informada."),
          ),
      },
      confirmCheckIn: {
        execute: vi.fn(),
      },
      issueGuestAccess: {
        execute: vi.fn(),
      },
    };

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
