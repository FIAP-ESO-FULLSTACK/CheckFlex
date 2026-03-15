"use client";

import { ArrowRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { FormEvent } from "react";
import { Button } from "@/presentation/components/ui/button";
import { TextField } from "@/presentation/components/ui/text-field";

/**
 * Props da primeira etapa da jornada, responsável por localizar a reserva.
 */
interface ReservationLookupFormProps {
  reservationCode: string;
  isLoading: boolean;
  onChange: (field: "reservationCode", value: string) => void;
  onSubmit: () => Promise<void>;
}

/**
 * Formulário inicial do totem.
 * Permite ao hóspede buscar a reserva usando apenas o código informado.
 */
export const ReservationLookupForm = ({
  reservationCode,
  isLoading,
  onChange,
  onSubmit,
}: ReservationLookupFormProps) => {
  // Mantém a submissão centralizada para preservar o contrato assíncrono do fluxo.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <form className="surface surface--feature" onSubmit={handleSubmit}>
      <div className="surface__header">
        <div>
          <span className="eyebrow">Etapa 1</span>
          <h2>Encontre sua reserva</h2>
        </div>
        <div className="icon-badge">
          <MagnifyingGlassIcon />
        </div>
      </div>

      <div className="surface__content surface__content--single-field">
        <TextField
          autoComplete="off"
          id="reservationCode"
          label="Código da reserva"
          onChange={(event) => onChange("reservationCode", event.target.value)}
          placeholder="Ex.: CKF-5042"
          required
          value={reservationCode}
        />
      </div>

      <div className="surface__footer">
        <p className="soft-note">Digite o código da reserva para continuar.</p>

        <Button disabled={isLoading} type="submit">
          {isLoading ? "Buscando reserva..." : "Continuar"}
          <ArrowRightIcon />
        </Button>
      </div>
    </form>
  );
};
