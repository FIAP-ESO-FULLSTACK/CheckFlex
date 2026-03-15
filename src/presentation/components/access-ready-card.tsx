"use client";

import * as Separator from "@radix-ui/react-separator";
import { CheckCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { GuestAccess } from "@/domain/entities/guest-access";
import { formatStayWindow, maskPhone } from "@/shared/formatters";
import { Button } from "@/presentation/components/ui/button";

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
  // Telefones são mascarados para reduzir exposição visual de dados pessoais.
  const digitalTarget =
    access.digitalKeyChannel === "phone"
      ? maskPhone(access.digitalKeyTarget)
      : access.digitalKeyTarget;

  return (
    <section className="surface surface--feature surface--success">
      <div className="surface__header">
        <div>
          <span className="eyebrow">Etapa 3</span>
          <h2>Seu acesso está pronto</h2>
        </div>
        <div className="icon-badge icon-badge--success">
          <CheckCircledIcon />
        </div>
      </div>

      <div className="access-hero">
        <div>
          <span className="access-hero__label">PIN temporário</span>
          <strong className="access-hero__pin">{access.pin}</strong>
        </div>
        <div className="access-hero__meta">
          <span>Quarto {access.roomNumber}</span>
          <span>{access.roomLabel}</span>
        </div>
      </div>

      <Separator.Root className="separator" decorative orientation="horizontal" />

      <div className="access-grid">
        <div className="reservation-card">
          <span className="reservation-card__label">Chave digital</span>
          <strong>{digitalTarget}</strong>
          <p>Enviada pelo app {access.appProvider}</p>
        </div>
        <div className="reservation-card">
          <span className="reservation-card__label">Validade</span>
          <strong>Até o checkout</strong>
          <p>{formatStayWindow(new Date().toISOString(), access.expiresAt)}</p>
        </div>
      </div>

      <div className="surface__footer">
        <p className="soft-note">
          Guarde este PIN. Ele já pode ser usado para entrar no quarto.
        </p>
        <Button onClick={onRestart} type="button" variant="secondary">
          Iniciar novo atendimento
          <ReloadIcon />
        </Button>
      </div>
    </section>
  );
};
