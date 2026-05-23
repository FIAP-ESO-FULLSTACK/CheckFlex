import { beforeEach, describe, expect, it } from "vitest";
import { CheckFlexDatabase, createDatabase } from "@/infrastructure/db/client";
import { eventLogs } from "@/infrastructure/db/schema";
import { SqliteEventLogger } from "@/infrastructure/observability/sqlite-event-logger";

describe("SqliteEventLogger", () => {
  let db: CheckFlexDatabase;
  let logger: SqliteEventLogger;

  beforeEach(() => {
    db = createDatabase(":memory:");
    logger = new SqliteEventLogger(db, "default-hotel", "kiosk-lobby-01");
  });

  it("persiste o evento e o associa ao hotel/totem ativo", async () => {
    await logger.record({ type: "check-in.completed", metadata: { reservationId: "res-1" } });

    const rows = db.select().from(eventLogs).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].hotelId).toBe("default-hotel");
    expect(rows[0].kioskId).toBe("kiosk-lobby-01");
    expect(rows[0].type).toBe("check-in.completed");
    expect(rows[0].metadata).toContain("res-1");
  });

  it("retorna agregados zerados quando não há eventos", async () => {
    const summary = await logger.summarize();
    expect(summary.total).toBe(0);
    expect(summary.byType["check-in.completed"]).toBe(0);
    expect(summary.byType["language.changed"]).toBe(0);
  });

  it("agrega contadores por tipo após registrar eventos", async () => {
    await logger.record({ type: "check-in.completed" });
    await logger.record({ type: "check-in.completed" });
    await logger.record({ type: "access.issued" });
    await logger.record({ type: "language.changed", metadata: { locale: "en" } });

    const summary = await logger.summarize();

    expect(summary.total).toBe(4);
    expect(summary.byType["check-in.completed"]).toBe(2);
    expect(summary.byType["access.issued"]).toBe(1);
    expect(summary.byType["language.changed"]).toBe(1);
    expect(summary.byType["check-out.completed"]).toBe(0);
  });
});
