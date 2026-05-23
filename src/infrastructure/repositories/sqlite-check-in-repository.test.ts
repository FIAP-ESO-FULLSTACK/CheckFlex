import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { CheckFlexDatabase, createDatabase } from "@/infrastructure/db/client";
import {
  guestAccesses,
  hotels,
  reservations,
} from "@/infrastructure/db/schema";
import { SqliteCheckInRepository } from "@/infrastructure/repositories/sqlite-check-in-repository";

describe("SqliteCheckInRepository", () => {
  let db: CheckFlexDatabase;
  let repository: SqliteCheckInRepository;

  beforeEach(() => {
    // Cada teste recebe um banco em memória isolado para não compartilhar estado.
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
        guestDocument: "123.456.789-09",
        guestBirthDate: null,
        checkInDate: "2026-03-14T14:00:00.000Z",
        checkOutDate: "2026-03-17T12:00:00.000Z",
        nights: 3,
        status: "reserved",
      })
      .run();
    db.insert(reservations)
      .values({
        id: "res-212",
        hotelId: "default-hotel",
        code: "CKF-2128",
        propertyName: "Fiap Suítes",
        roomNumber: "212",
        roomLabel: "Quarto Jardim",
        guestFullName: "Rafael Costa",
        guestDocument: null,
        guestBirthDate: "1990-05-22",
        checkInDate: "2026-03-14T14:00:00.000Z",
        checkOutDate: "2026-03-15T12:00:00.000Z",
        nights: 1,
        status: "reserved",
      })
      .run();

    repository = new SqliteCheckInRepository(db, "default-hotel");
  });

  afterEach(() => {
    db.delete(guestAccesses).run();
    db.delete(reservations).run();
    db.delete(hotels).run();
  });

  it("retorna a reserva quando código + CPF batem", async () => {
    const reservation = await repository.findReservation({
      code: "CKF-5042",
      document: "12345678909",
    });

    expect(reservation).not.toBeNull();
    expect(reservation?.guestFullName).toBe("Marina Alves");
  });

  it("aceita CPF com máscara durante a busca", async () => {
    const reservation = await repository.findReservation({
      code: "ckf-5042",
      document: "123.456.789-09",
    });

    expect(reservation).not.toBeNull();
  });

  it("retorna a reserva quando código + data de nascimento batem", async () => {
    const reservation = await repository.findReservation({
      code: "CKF-2128",
      birthDate: "22/05/1990",
    });

    expect(reservation).not.toBeNull();
    expect(reservation?.roomNumber).toBe("212");
  });

  it("rejeita a busca quando o segundo fator não confere", async () => {
    const reservation = await repository.findReservation({
      code: "CKF-5042",
      document: "00000000000",
    });

    expect(reservation).toBeNull();
  });

  it("rejeita a busca quando o segundo fator está ausente", async () => {
    const reservation = await repository.findReservation({
      code: "CKF-5042",
    });

    expect(reservation).toBeNull();
  });

  it("confirma o check-in e atualiza o status para checked-in", async () => {
    const reservation = await repository.confirmCheckIn("res-504");
    expect(reservation.status).toBe("checked-in");

    await expect(repository.confirmCheckIn("res-504")).rejects.toThrow(
      /já está em check-in/,
    );
  });

  it("emite a credencial e persiste no banco", async () => {
    const access = await repository.issueGuestAccess({
      reservationId: "res-504",
      phone: "+5511999999999",
    });

    expect(access.pin).toBe("320504");
    expect(access.digitalKeyChannel).toBe("phone");

    const stored = db.select().from(guestAccesses).all();
    expect(stored).toHaveLength(1);
    expect(stored[0].reservationId).toBe("res-504");
  });

  it("conclui o check-out e revoga credenciais ativas", async () => {
    await repository.confirmCheckIn("res-504");
    await repository.issueGuestAccess({
      reservationId: "res-504",
      phone: "+5511999999999",
    });

    const result = await repository.checkout("res-504");

    expect(result.revokedAccessCount).toBe(1);
    expect(result.reservation.status).toBe("checked-out");

    const accesses = db.select().from(guestAccesses).all();
    expect(accesses[0].revokedAt).not.toBeNull();
  });

  it("impede o check-out antes do check-in", async () => {
    await expect(repository.checkout("res-504")).rejects.toThrow(/após o check-in/);
  });

  it("não retorna reservas de outro hotel mesmo que código + CPF batam", async () => {
    db.insert(hotels)
      .values({ id: "outro-hotel", name: "Outro Hotel" })
      .run();
    db.insert(reservations)
      .values({
        id: "res-other",
        hotelId: "outro-hotel",
        code: "OTH-0001",
        propertyName: "Outro Hotel",
        roomNumber: "10",
        roomLabel: "Standard",
        guestFullName: "João Silva",
        guestDocument: "11111111111",
        guestBirthDate: null,
        checkInDate: "2026-03-14T14:00:00.000Z",
        checkOutDate: "2026-03-15T12:00:00.000Z",
        nights: 1,
        status: "reserved",
      })
      .run();

    const result = await repository.findReservation({
      code: "OTH-0001",
      document: "11111111111",
    });

    expect(result).toBeNull();
  });

  it("revoga credenciais expiradas automaticamente", async () => {
    // Cria uma reserva já vencida no banco para testar a varredura.
    db.insert(reservations)
      .values({
        id: "res-expired",
        hotelId: "default-hotel",
        code: "CKF-OLD",
        propertyName: "Fiap Suítes",
        roomNumber: "101",
        roomLabel: "Quarto Antigo",
        guestFullName: "Ana Lima",
        guestDocument: "11111111111",
        guestBirthDate: null,
        checkInDate: "2026-01-01T14:00:00.000Z",
        checkOutDate: "2026-01-02T12:00:00.000Z",
        nights: 1,
        status: "checked-in",
      })
      .run();
    await repository.issueGuestAccess({
      reservationId: "res-expired",
      email: "ana@example.com",
    });

    const revoked = await repository.revokeExpiredAccesses(
      "2026-03-20T12:00:00.000Z",
    );

    expect(revoked).toBe(1);

    const [updatedReservation] = db
      .select()
      .from(reservations)
      .where(eq(reservations.id, "res-expired"))
      .all();
    expect(updatedReservation.status).toBe("checked-out");
  });
});
