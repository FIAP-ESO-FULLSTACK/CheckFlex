import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm";
import * as schema from "@/infrastructure/db/schema";

// Caminho do banco em arquivo único. Mantém o projeto 100% local conforme o STACK.md.
const DEFAULT_DB_PATH = "./checkflex.db";

export type CheckFlexDatabase = ReturnType<typeof drizzle<typeof schema>>;

let cachedDatabase: CheckFlexDatabase | null = null;

// Cria as tabelas em memória/arquivo se ainda não existirem. Mantemos os
// comandos inline para evitar a complexidade de uma ferramenta separada de
// migração num projeto acadêmico.
const ensureSchema = (db: CheckFlexDatabase) => {
  db.run(sql`CREATE TABLE IF NOT EXISTS hotels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    hotel_id TEXT NOT NULL REFERENCES hotels(id),
    code TEXT NOT NULL UNIQUE,
    property_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    room_label TEXT NOT NULL,
    guest_full_name TEXT NOT NULL,
    guest_document TEXT,
    guest_birth_date TEXT,
    check_in_date TEXT NOT NULL,
    check_out_date TEXT NOT NULL,
    nights INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'reserved'
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS guest_accesses (
    id TEXT PRIMARY KEY,
    reservation_id TEXT NOT NULL REFERENCES reservations(id),
    pin TEXT NOT NULL,
    digital_key_channel TEXT NOT NULL,
    digital_key_target TEXT NOT NULL,
    notification_email TEXT,
    room_number TEXT NOT NULL,
    room_label TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    app_provider TEXT NOT NULL,
    revoked_at TEXT,
    created_at TEXT NOT NULL DEFAULT (current_timestamp)
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS event_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_id TEXT NOT NULL,
    kiosk_id TEXT NOT NULL,
    type TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (current_timestamp)
  )`);
};

// Constrói (e armazena) a conexão para o caminho passado, sempre garantindo
// que o schema esteja aplicado. Sem o cache cada chamada abriria um novo handle.
export const createDatabase = (filePath: string = DEFAULT_DB_PATH) => {
  const sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  ensureSchema(db);
  return db;
};

// Recupera o banco padrão usado pela aplicação. Permite passar caminho custom
// quando os testes precisam de um banco em memória isolado.
export const getDatabase = (filePath: string = DEFAULT_DB_PATH) => {
  if (filePath !== DEFAULT_DB_PATH) {
    return createDatabase(filePath);
  }

  if (!cachedDatabase) {
    cachedDatabase = createDatabase(filePath);
  }

  return cachedDatabase;
};

// Usado em testes para forçar a abertura de um novo banco.
export const resetDatabaseCache = () => {
  cachedDatabase = null;
};
