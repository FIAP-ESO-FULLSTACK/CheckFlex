import { randomUUID } from "node:crypto";
import { and, eq, isNull, lt } from "drizzle-orm";
import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation, ReservationStatus } from "@/domain/entities/reservation";
import {
  AccessRequest,
  CheckInRepository,
  CheckoutRepository,
  CheckoutResult,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";
import { KeyIssuanceAdapter } from "@/domain/ports/key-issuance-adapter";
import { CheckFlexDatabase } from "@/infrastructure/db/client";
import { GLocksMockAdapter } from "@/infrastructure/adapters/glocks-mock-adapter";
import {
  guestAccesses,
  reservations,
} from "@/infrastructure/db/schema";

// Define o escopo padrão de hotel quando nenhum é informado pelo composer.
const DEFAULT_HOTEL_ID = "default-hotel";

// Normaliza CPF deixando apenas dígitos para tolerar máscara/espaços do input.
const normalizeDocument = (value?: string | null) =>
  value ? value.replace(/\D/g, "") : null;

// Normaliza data de nascimento aceitando dd/mm/yyyy ou ISO. Sempre retorna ISO curto.
const normalizeBirthDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  return trimmed;
};

// Converte a linha persistida em entidade de domínio sem expor colunas extras.
const normalizeStatus = (raw: string): ReservationStatus => {
  if (raw === "checked-in") return "checked-in";
  if (raw === "checked-out") return "checked-out";
  return "reserved";
};

const toReservation = (
  row: typeof reservations.$inferSelect,
): Reservation => ({
  id: row.id,
  code: row.code,
  propertyName: row.propertyName,
  roomNumber: row.roomNumber,
  roomLabel: row.roomLabel,
  guestFullName: row.guestFullName,
  checkInDate: row.checkInDate,
  checkOutDate: row.checkOutDate,
  nights: row.nights,
  status: normalizeStatus(row.status),
});

const toGuestAccess = (
  row: typeof guestAccesses.$inferSelect,
): GuestAccess => ({
  pin: row.pin,
  digitalKeyChannel: row.digitalKeyChannel === "email" ? "email" : "phone",
  digitalKeyTarget: row.digitalKeyTarget,
  notificationEmail: row.notificationEmail ?? null,
  roomNumber: row.roomNumber,
  roomLabel: row.roomLabel,
  expiresAt: row.expiresAt,
  appProvider: row.appProvider,
});

/**
 * Implementação persistente do CheckInRepository sobre SQLite.
 * Mantém o mesmo contrato do mock para que a camada de aplicação não precise
 * conhecer detalhes de armazenamento.
 */
export class SqliteCheckInRepository
  implements CheckInRepository, CheckoutRepository
{
  // O adapter de emissão é injetável para permitir trocar a "G-Locks mock"
  // por uma integração real sem mudar a regra de negócio.
  constructor(
    private readonly db: CheckFlexDatabase,
    private readonly hotelId: string = DEFAULT_HOTEL_ID,
    private readonly keyIssuanceAdapter: KeyIssuanceAdapter = new GLocksMockAdapter(),
  ) {}

  async findReservation(input: ReservationLookup): Promise<Reservation | null> {
    const code = input.code.trim().toUpperCase();
    if (!code) {
      return null;
    }

    const [row] = await this.db
      .select()
      .from(reservations)
      .where(
        and(eq(reservations.code, code), eq(reservations.hotelId, this.hotelId)),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    const expectedDocument = normalizeDocument(row.guestDocument);
    const expectedBirth = normalizeBirthDate(row.guestBirthDate);
    const informedDocument = normalizeDocument(input.document);
    const informedBirth = normalizeBirthDate(input.birthDate);

    const matchesDocument =
      expectedDocument != null &&
      informedDocument != null &&
      expectedDocument === informedDocument;

    const matchesBirth =
      expectedBirth != null &&
      informedBirth != null &&
      expectedBirth === informedBirth;

    // Quando a reserva exige segundo fator a UI precisa enviar um deles.
    if (expectedDocument || expectedBirth) {
      if (!matchesDocument && !matchesBirth) {
        return null;
      }
    }

    return toReservation(row);
  }

  async confirmCheckIn(reservationId: string): Promise<Reservation> {
    const [row] = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1);

    if (!row) {
      throw new Error("Reserva não encontrada para confirmação.");
    }

    if (row.status === "checked-in") {
      throw new Error("Essa reserva já está em check-in concluído.");
    }

    await this.db
      .update(reservations)
      .set({ status: "checked-in" })
      .where(eq(reservations.id, reservationId));

    return toReservation({ ...row, status: "checked-in" });
  }

  async issueGuestAccess(input: AccessRequest): Promise<GuestAccess> {
    const [row] = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.id, input.reservationId))
      .limit(1);

    if (!row) {
      throw new Error("Não foi possível localizar a reserva para emitir o acesso.");
    }

    const reservation = toReservation(row);
    const channel = input.phone ? "phone" : "email";
    const target = input.phone ?? input.email ?? "";
    const notificationEmail = input.email?.trim() || null;

    // A emissão fica a cargo do KeyIssuanceAdapter, simulando a integração
    // com a fechadura G-Locks. Aqui só persistimos o resultado.
    const issued = await this.keyIssuanceAdapter.issue({
      reservation,
      channel,
      target,
    });

    await this.db.insert(guestAccesses).values({
      id: randomUUID(),
      reservationId: reservation.id,
      pin: issued.pin,
      digitalKeyChannel: issued.digitalKeyChannel,
      digitalKeyTarget: issued.digitalKeyTarget,
      notificationEmail,
      roomNumber: issued.roomNumber,
      roomLabel: issued.roomLabel,
      expiresAt: issued.expiresAt,
      appProvider: issued.appProvider,
    });

    return { ...issued, notificationEmail };
  }

  async checkout(reservationId: string): Promise<CheckoutResult> {
    const [row] = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1);

    if (!row) {
      throw new Error("Reserva não encontrada para check-out.");
    }

    if (row.status === "checked-out") {
      throw new Error("Essa reserva já foi finalizada.");
    }

    if (row.status !== "checked-in") {
      throw new Error("O check-out só pode ser feito após o check-in.");
    }

    const now = new Date().toISOString();

    // Antes de revogar, recuperamos a credencial ativa para devolver à UI
    // (precisamos do PIN e do e-mail informado no check-in).
    const [activeAccess] = await this.db
      .select()
      .from(guestAccesses)
      .where(
        and(
          eq(guestAccesses.reservationId, reservationId),
          isNull(guestAccesses.revokedAt),
        ),
      )
      .orderBy(guestAccesses.createdAt)
      .limit(1);

    const revoked = await this.db
      .update(guestAccesses)
      .set({ revokedAt: now })
      .where(
        and(
          eq(guestAccesses.reservationId, reservationId),
          isNull(guestAccesses.revokedAt),
        ),
      )
      .returning({ id: guestAccesses.id });

    await this.db
      .update(reservations)
      .set({ status: "checked-out" })
      .where(eq(reservations.id, reservationId));

    return {
      reservation: toReservation({ ...row, status: "checked-out" }),
      revokedAccessCount: revoked.length,
      revokedAccess: activeAccess ? toGuestAccess(activeAccess) : null,
    };
  }

  async revokeExpiredAccesses(referenceTime: string): Promise<number> {
    const expired = await this.db
      .select({
        id: reservations.id,
      })
      .from(reservations)
      .where(
        and(
          eq(reservations.hotelId, this.hotelId),
          lt(reservations.checkOutDate, referenceTime),
        ),
      );

    if (expired.length === 0) {
      return 0;
    }

    let revokedCount = 0;
    for (const { id } of expired) {
      const revoked = await this.db
        .update(guestAccesses)
        .set({ revokedAt: referenceTime })
        .where(
          and(
            eq(guestAccesses.reservationId, id),
            isNull(guestAccesses.revokedAt),
          ),
        )
        .returning({ id: guestAccesses.id });

      if (revoked.length > 0) {
        await this.db
          .update(reservations)
          .set({ status: "checked-out" })
          .where(eq(reservations.id, id));
      }

      revokedCount += revoked.length;
    }

    return revokedCount;
  }
}
