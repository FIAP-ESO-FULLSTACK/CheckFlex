"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
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
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button type="button" variant="ghost">
          <ExclamationTriangleIcon />
          Precisa de ajuda?
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <div className="dialog-content__header">
            <div>
              <Dialog.Title>Ajuda rápida</Dialog.Title>
              <Dialog.Description>
                Se estiver testando esta demonstração, você pode usar um dos
                códigos de reserva abaixo.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button aria-label="Fechar" className="dialog-close" type="button">
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
            <li>Digite um dos códigos no campo de busca para localizar a reserva.</li>
            <li>Se ainda não conseguir continuar, procure a recepção para apoio.</li>
          </ol>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
