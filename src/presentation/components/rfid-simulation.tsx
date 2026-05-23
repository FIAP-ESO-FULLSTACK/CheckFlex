"use client";

import { CheckCircledIcon, IdCardIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/locale-context";

// Estados visuais da simulação. Mantemos uma máquina linear porque o totem
// só precisa avançar do "encoste o cartão" até o sucesso.
export type RfidStage = "tap" | "loading" | "ready";

interface RfidSimulationProps {
  // Tempos parametrizados para testes; no totem real usamos os defaults.
  tapDurationMs?: number;
  loadingDurationMs?: number;
}

const DEFAULT_TAP_DURATION_MS = 4000;
const DEFAULT_LOADING_DURATION_MS = 3000;

/**
 * Simula o fluxo de gravação de credencial em um cartão RFID.
 * Apresentação puramente visual: avança pelos três estágios para a apresentação
 * cliente sem depender de hardware. Substituível por uma integração real
 * quando o adapter RFID estiver disponível.
 */
export const RfidSimulation = ({
  tapDurationMs = DEFAULT_TAP_DURATION_MS,
  loadingDurationMs = DEFAULT_LOADING_DURATION_MS,
}: RfidSimulationProps) => {
  const { t } = useTranslation();
  const [stage, setStage] = useState<RfidStage>("tap");

  useEffect(() => {
    // Apenas progredimos uma vez ao montar; quando o atendimento reinicia,
    // o componente desmonta e remonta a partir do "tap" naturalmente.
    const toLoading = setTimeout(() => setStage("loading"), tapDurationMs);
    const toReady = setTimeout(
      () => setStage("ready"),
      tapDurationMs + loadingDurationMs,
    );
    return () => {
      clearTimeout(toLoading);
      clearTimeout(toReady);
    };
  }, [tapDurationMs, loadingDurationMs]);

  return (
    <div
      aria-live="polite"
      className={`rfid-block rfid-block--${stage}`}
      data-stage={stage}
      role="status"
    >
      <div className="rfid-block__visual" aria-hidden="true">
        {stage === "tap" ? (
          <IdCardIcon className="rfid-block__icon" />
        ) : null}
        {stage === "loading" ? <span className="rfid-spinner" /> : null}
        {stage === "ready" ? (
          <CheckCircledIcon className="rfid-block__icon rfid-block__icon--ready" />
        ) : null}
      </div>

      <div className="rfid-block__text">
        {stage === "tap" ? (
          <>
            <strong>{t("ready.rfidTap")}</strong>
            <span>{t("ready.rfidTapHint")}</span>
          </>
        ) : null}
        {stage === "loading" ? <strong>{t("ready.rfidLoading")}</strong> : null}
        {stage === "ready" ? <strong>{t("ready.rfidReady")}</strong> : null}
      </div>
    </div>
  );
};
