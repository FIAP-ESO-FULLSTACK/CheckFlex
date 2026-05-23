/**
 * Tipos de evento operacional registrados pelo totem.
 * Mantém uma união fechada para evitar logs com nomes diferentes para o
 * mesmo evento e simplificar a leitura das métricas.
 */
export type CheckFlexEventType =
  | "check-in.completed"
  | "access.issued"
  | "check-out.completed"
  | "access.revoked"
  | "language.changed";

export interface CheckFlexEvent {
  type: CheckFlexEventType;
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * Porta usada pelas camadas de aplicação para registrar eventos sem conhecer
 * o adapter concreto (SQLite + pino, console, etc.).
 */
export interface EventLogger {
  record(event: CheckFlexEvent): Promise<void>;
}

export interface MetricsSummary {
  byType: Record<CheckFlexEventType, number>;
  total: number;
}

export interface MetricsRepository {
  summarize(): Promise<MetricsSummary>;
}
