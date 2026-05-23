import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Hotel ativo do totem. Suporte mínimo a multi-tenant: cada reserva e evento
// pertence a um hotel para que o mesmo banco possa servir mais de uma unidade.
export const hotels = sqliteTable("hotels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

// Reserva conhecida pelo totem. Inclui o segundo fator usado na validação de
// identidade do hóspede (CPF ou data de nascimento para estrangeiros).
export const reservations = sqliteTable("reservations", {
  id: text("id").primaryKey(),
  hotelId: text("hotel_id")
    .notNull()
    .references(() => hotels.id),
  code: text("code").notNull().unique(),
  propertyName: text("property_name").notNull(),
  roomNumber: text("room_number").notNull(),
  roomLabel: text("room_label").notNull(),
  guestFullName: text("guest_full_name").notNull(),
  guestDocument: text("guest_document"),
  guestBirthDate: text("guest_birth_date"),
  checkInDate: text("check_in_date").notNull(),
  checkOutDate: text("check_out_date").notNull(),
  nights: integer("nights").notNull(),
  status: text("status").notNull().default("reserved"),
});

// Credencial emitida ao concluir o check-in. Mantida no banco para permitir
// revogação automática quando a estadia se encerra.
export const guestAccesses = sqliteTable("guest_accesses", {
  id: text("id").primaryKey(),
  reservationId: text("reservation_id")
    .notNull()
    .references(() => reservations.id),
  pin: text("pin").notNull(),
  digitalKeyChannel: text("digital_key_channel").notNull(),
  digitalKeyTarget: text("digital_key_target").notNull(),
  notificationEmail: text("notification_email"),
  roomNumber: text("room_number").notNull(),
  roomLabel: text("room_label").notNull(),
  expiresAt: text("expires_at").notNull(),
  appProvider: text("app_provider").notNull(),
  revokedAt: text("revoked_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// Log de eventos operacionais consumido pelas métricas simples do gestor.
export const eventLogs = sqliteTable("event_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hotelId: text("hotel_id").notNull(),
  kioskId: text("kiosk_id").notNull(),
  type: text("type").notNull(),
  metadata: text("metadata"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
