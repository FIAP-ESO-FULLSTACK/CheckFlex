import pino from "pino";
import { sql } from "drizzle-orm";
import {
  CheckFlexEvent,
  CheckFlexEventType,
  EventLogger,
  MetricsRepository,
  MetricsSummary,
} from "@/domain/services/event-logger";
import { CheckFlexDatabase } from "@/infrastructure/db/client";
import { eventLogs } from "@/infrastructure/db/schema";

const logger = pino({
  name: "checkflex",
  level: process.env.CHECKFLEX_LOG_LEVEL ?? "info",
});

// Lista canônica dos eventos suportados, usada para inicializar o agregado
// e garantir que o consumidor sempre receba todas as chaves.
const KNOWN_EVENTS: CheckFlexEventType[] = [
  "check-in.completed",
  "access.issued",
  "check-out.completed",
  "access.revoked",
  "language.changed",
];

/**
 * Implementação simples do EventLogger e MetricsRepository sobre SQLite.
 * Cada evento vai para o banco e também para o pino para inspeção no terminal.
 */
export class SqliteEventLogger implements EventLogger, MetricsRepository {
  constructor(
    private readonly db: CheckFlexDatabase,
    private readonly hotelId: string,
    private readonly kioskId: string,
  ) {}

  async record(event: CheckFlexEvent): Promise<void> {
    const payload = event.metadata ? JSON.stringify(event.metadata) : null;
    await this.db.insert(eventLogs).values({
      hotelId: this.hotelId,
      kioskId: this.kioskId,
      type: event.type,
      metadata: payload,
    });
    logger.info(
      {
        type: event.type,
        hotelId: this.hotelId,
        kioskId: this.kioskId,
        metadata: event.metadata ?? {},
      },
      "evento",
    );
  }

  async summarize(): Promise<MetricsSummary> {
    const rows = await this.db
      .select({
        type: eventLogs.type,
        count: sql<number>`count(*)`,
      })
      .from(eventLogs)
      .groupBy(eventLogs.type);

    const byType = KNOWN_EVENTS.reduce(
      (acc, key) => {
        acc[key] = 0;
        return acc;
      },
      {} as Record<CheckFlexEventType, number>,
    );

    let total = 0;
    for (const row of rows) {
      const numeric = Number(row.count) || 0;
      if ((KNOWN_EVENTS as string[]).includes(row.type)) {
        byType[row.type as CheckFlexEventType] = numeric;
      }
      total += numeric;
    }

    return { byType, total };
  }
}
