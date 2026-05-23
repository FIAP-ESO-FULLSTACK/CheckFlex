import { RevokeExpiredAccessUseCase } from "@/application/use-cases/revoke-expired-access-use-case";
import { getDatabase } from "@/infrastructure/db/client";
import { SqliteEventLogger } from "@/infrastructure/observability/sqlite-event-logger";
import { getRuntimeConfig } from "@/infrastructure/runtime/config";
import { SqliteCheckInRepository } from "@/infrastructure/repositories/sqlite-check-in-repository";

// Wrappers de uso server-side. Manter uma instância única evita reabrir o
// banco a cada request e dá um ponto de inicialização para o sweeper.
let cachedRepository: SqliteCheckInRepository | null = null;
let cachedEventLogger: SqliteEventLogger | null = null;
let sweepTimer: ReturnType<typeof setInterval> | null = null;

// Intervalo da varredura periódica de credenciais expiradas.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

const startSweeper = (
  repository: SqliteCheckInRepository,
  eventLogger: SqliteEventLogger,
) => {
  if (sweepTimer) {
    return;
  }
  const useCase = new RevokeExpiredAccessUseCase(repository);

  const sweep = async () => {
    const revoked = await useCase.execute();
    if (revoked > 0) {
      await eventLogger.record({
        type: "access.revoked",
        metadata: { reason: "expired", count: revoked },
      });
    }
  };

  // Roda uma vez na inicialização e depois em intervalo curto. Erros aqui não
  // devem derrubar a API.
  sweep().catch(() => undefined);
  sweepTimer = setInterval(() => {
    sweep().catch(() => undefined);
  }, SWEEP_INTERVAL_MS);
  if (typeof sweepTimer.unref === "function") {
    sweepTimer.unref();
  }
};

export const getServerEventLogger = () => {
  if (!cachedEventLogger) {
    const { hotelId, kioskId } = getRuntimeConfig();
    cachedEventLogger = new SqliteEventLogger(getDatabase(), hotelId, kioskId);
  }
  return cachedEventLogger;
};

export const getServerCheckInRepository = () => {
  if (!cachedRepository) {
    const { hotelId } = getRuntimeConfig();
    cachedRepository = new SqliteCheckInRepository(getDatabase(), hotelId);
    startSweeper(cachedRepository, getServerEventLogger());
  }
  return cachedRepository;
};

// Permite resetar o cache em testes que sobem um banco isolado por execução.
export const resetServerCheckInRepository = () => {
  if (sweepTimer) {
    clearInterval(sweepTimer);
    sweepTimer = null;
  }
  cachedRepository = null;
  cachedEventLogger = null;
};
