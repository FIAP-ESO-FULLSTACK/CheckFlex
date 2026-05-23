import { beforeEach, describe, expect, it } from "vitest";
import { LocalPmsAdapter } from "@/infrastructure/adapters/local-pms-adapter";
import { CheckFlexDatabase, createDatabase } from "@/infrastructure/db/client";
import { hotels, reservations } from "@/infrastructure/db/schema";
import { SqliteCheckInRepository } from "@/infrastructure/repositories/sqlite-check-in-repository";

describe("LocalPmsAdapter", () => {
  let db: CheckFlexDatabase;
  let adapter: LocalPmsAdapter;

  beforeEach(() => {
    db = createDatabase(":memory:");
    db.insert(hotels)
      .values({ id: "default-hotel", name: "Fiap Suítes" })
      .run();
    db.insert(reservations)
      .values({
        id: "res-504",
        hotelId: "default-hotel",
        code: "CKF-5042",
        propertyName: "Fiap Suítes",
        roomNumber: "504",
        roomLabel: "Suíte Horizonte",
        guestFullName: "Marina Alves",
        guestDocument: "12345678909",
        guestBirthDate: null,
        checkInDate: "2026-03-14T14:00:00.000Z",
        checkOutDate: "2026-03-17T12:00:00.000Z",
        nights: 3,
        status: "reserved",
      })
      .run();
    adapter = new LocalPmsAdapter(
      new SqliteCheckInRepository(db, "default-hotel"),
    );
  });

  it("encadeia busca → check-in → fechamento da estadia", async () => {
    const reserved = await adapter.findReservation({
      code: "CKF-5042",
      document: "12345678909",
    });
    expect(reserved?.status).toBe("reserved");

    const checkedIn = await adapter.confirmCheckIn("res-504");
    expect(checkedIn.status).toBe("checked-in");

    const closed = await adapter.closeStay("res-504");
    expect(closed.status).toBe("checked-out");
  });
});
