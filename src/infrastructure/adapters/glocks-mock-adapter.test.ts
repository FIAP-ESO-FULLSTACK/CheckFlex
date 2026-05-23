import { describe, expect, it } from "vitest";
import { GLocksMockAdapter } from "@/infrastructure/adapters/glocks-mock-adapter";
import { makeReservation } from "@/test/factories/check-in-test-data";

describe("GLocksMockAdapter", () => {
  it("emite uma chave digital coerente com a reserva", async () => {
    const adapter = new GLocksMockAdapter();

    const access = await adapter.issue({
      reservation: makeReservation({ roomNumber: "504", checkOutDate: "2026-03-17T12:00:00.000Z" }),
      channel: "phone",
      target: "+5511999999999",
    });

    expect(access.pin).toBe("320504");
    expect(access.digitalKeyChannel).toBe("phone");
    expect(access.digitalKeyTarget).toBe("+5511999999999");
    expect(access.appProvider).toBe("G-Locks");
    expect(access.expiresAt).toBe("2026-03-17T12:00:00.000Z");
  });

  it("retorna PIN padrão para quartos sem número numérico", async () => {
    const adapter = new GLocksMockAdapter();
    const access = await adapter.issue({
      reservation: makeReservation({ roomNumber: "P-A1" }),
      channel: "email",
      target: "guest@example.com",
    });

    expect(access.pin).toBe("320000");
  });
});
