"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useTranslation } from "@/i18n/locale-context";
import { Button } from "@/presentation/components/ui/button";

/**
 * Props do modal de ajuda exibido no cabeçalho do totem.
 */
interface SupportDialogProps {
  reservationCodeExamples: string[];
}

/**
 * Modal de apoio rápido com exemplos de códigos válidos para a demonstração.
 */
export const SupportDialog = ({
  reservationCodeExamples,
}: SupportDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button type="button" variant="ghost">
          <ExclamationTriangleIcon />
          {t("support.trigger")}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <div className="dialog-content__header">
            <div>
              <Dialog.Title>{t("support.title")}</Dialog.Title>
              <Dialog.Description>{t("support.description")}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label={t("support.close")}
                className="dialog-close"
                type="button"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>

          <div className="dialog-examples">
            {reservationCodeExamples.map((reservationCode) => (
              <code className="dialog-code-chip" key={reservationCode}>
                {reservationCode}
              </code>
            ))}
          </div>

          <ol className="dialog-list">
            <li>{t("support.listItem1")}</li>
            <li>{t("support.listItem2")}</li>
          </ol>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
