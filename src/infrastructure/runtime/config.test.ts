import { afterEach, describe, expect, it, vi } from "vitest";
import { getRuntimeConfig } from "@/infrastructure/runtime/config";

describe("getRuntimeConfig", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
    vi.unstubAllEnvs();
  });

  it("usa defaults quando nenhuma env é informada", () => {
    delete process.env.CHECKFLEX_HOTEL_ID;
    delete process.env.CHECKFLEX_KIOSK_ID;
    expect(getRuntimeConfig()).toEqual({
      hotelId: "default-hotel",
      kioskId: "kiosk-lobby-01",
    });
  });

  it("respeita as variáveis de ambiente fornecidas", () => {
    vi.stubEnv("CHECKFLEX_HOTEL_ID", "praia-mar-hotel");
    vi.stubEnv("CHECKFLEX_KIOSK_ID", "kiosk-pool-04");
    expect(getRuntimeConfig()).toEqual({
      hotelId: "praia-mar-hotel",
      kioskId: "kiosk-pool-04",
    });
  });
});
