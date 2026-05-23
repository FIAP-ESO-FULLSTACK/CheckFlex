"use client";

import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/locale-context";

interface EmailConfirmationToastProps {
  visible: boolean;
  onDismiss: () => void;
  durationMs?: number;
  email?: string;
}

const DEFAULT_DURATION_MS = 1500;

/**
 * Pop-up centralizado exibido brevemente após o hóspede emitir a credencial
 * ou concluir o check-out. Confirma visualmente que a notificação foi enviada
 * para o e-mail e, quando passado o destinatário, exibe-o em destaque.
 */
export const EmailConfirmationToast = ({
  visible,
  onDismiss,
  durationMs = DEFAULT_DURATION_MS,
  email,
}: EmailConfirmationToastProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(id);
  }, [visible, durationMs, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <div className="email-toast-overlay" role="status" aria-live="polite">
      <div className="email-toast">
        <span className="email-toast__icon" aria-hidden="true">
          <EnvelopeClosedIcon />
        </span>
        <div className="email-toast__copy">
          <strong className="email-toast__text">
            {t("toast.emailConfirmation")}
          </strong>
          {email ? <span className="email-toast__email">{email}</span> : null}
        </div>
      </div>
    </div>
  );
};
