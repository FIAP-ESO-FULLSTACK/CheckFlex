"use client";

import * as Separator from "@radix-ui/react-separator";
import { CheckCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { GuestAccess } from "@/domain/entities/guest-access";
import { useTranslation } from "@/i18n/locale-context";
import { formatStayWindow, maskPhone } from "@/shared/formatters";
import { Button } from "@/presentation/components/ui/button";
import { RfidSimulation } from "@/presentation/components/rfid-simulation";

/**
 * Exibe o resultado final do check-in com PIN, chave digital e validade do acesso.
 */
interface AccessReadyCardProps {
  access: GuestAccess;
  onRestart: () => void;
}

/**
 * Etapa final da jornada do hóspede.
 * Resume a credencial emitida e permite reiniciar o atendimento para a próxima pessoa.
 */
export const AccessReadyCard = ({
  access,
  onRestart,
}: AccessReadyCardProps) => {
  const { locale, t } = useTranslation();

  // Telefones são mascarados para reduzir exposição visual de dados pessoais.
  const digitalTarget =
    access.digitalKeyChannel === "phone"
      ? maskPhone(access.digitalKeyTarget)
      : access.digitalKeyTarget;

  return (
    <section className="surface surface--feature surface--success">
      <div className="surface__header">
        <div>
          <span className="eyebrow">{t("ready.stage")}</span>
          <h2>{t("ready.title")}</h2>
        </div>
        <div className="icon-badge icon-badge--success">
          <CheckCircledIcon />
        </div>
      </div>

      <div className="access-hero">
        <div>
          <span className="access-hero__label">{t("ready.pinLabel")}</span>
          <strong className="access-hero__pin">{access.pin}</strong>
        </div>
        <div className="access-hero__meta">
          <span>
            {t("ready.roomLabelTemplate", { number: access.roomNumber })}
          </span>
          <span>{access.roomLabel}</span>
        </div>
      </div>

      <Separator.Root className="separator" decorative orientation="horizontal" />

      <div className="access-grid">
        <div className="reservation-card">
          <span className="reservation-card__label">{t("ready.keyLabel")}</span>
          <strong>{digitalTarget}</strong>
          <p>{t("ready.sentByTemplate", { provider: access.appProvider })}</p>
        </div>
        <div className="reservation-card">
          <span className="reservation-card__label">
            {t("ready.validityLabel")}
          </span>
          <strong>{t("ready.untilCheckout")}</strong>
          <p>
            {formatStayWindow(
              new Date().toISOString(),
              access.expiresAt,
              locale,
              t("ready.stayUntil"),
            )}
          </p>
        </div>
      </div>

      <RfidSimulation />

      <div className="surface__footer">
        <p className="soft-note">{t("ready.keepPinNote")}</p>
        <Button onClick={onRestart} type="button" variant="secondary">
          {t("ready.restart")}
          <ReloadIcon />
        </Button>
      </div>
    </section>
  );
};
