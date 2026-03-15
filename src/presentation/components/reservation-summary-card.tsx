"use client";
import * as Separator from "@radix-ui/react-separator";
import { CheckIcon } from "@radix-ui/react-icons";
import { Reservation } from "@/domain/entities/reservation";
import { formatStayWindow } from "@/shared/formatters";
import { Button } from "@/presentation/components/ui/button";
import { TextField } from "@/presentation/components/ui/text-field";

/**
 * Props da etapa de revisão antes da emissão da credencial.
 */
interface ReservationSummaryCardProps {
  acceptedTerms: boolean;
  email: string;
  isSubmitting: boolean;
  phone: string;
  reservation: Reservation;
  onBack: () => void;
  onConfirm: () => Promise<void>;
  onContactChange: (field: "phone" | "email", value: string) => void;
  onToggleTerms: (value: boolean) => void;
}

/**
 * Apresenta os dados da hospedagem, coleta contato e confirma a intenção
 * do hóspede antes de concluir o check-in.
 */
export const ReservationSummaryCard = ({
  acceptedTerms,
  email,
  isSubmitting,
  phone,
  reservation,
  onBack,
  onConfirm,
  onContactChange,
  onToggleTerms,
}: ReservationSummaryCardProps) => {
  return (
    <section className="surface surface--feature">
      <div className="surface__header">
        <div>
          <span className="eyebrow">Etapa 2</span>
          <h2>Confirme seus dados</h2>
        </div>
        <div className="icon-badge icon-badge--success">
          <CheckIcon />
        </div>
      </div>

      <div className="reservation-grid">
        <div className="reservation-card">
          <span className="reservation-card__label">Nome</span>
          <strong>{reservation.guestFullName}</strong>
          <p>{reservation.propertyName}</p>
        </div>
        <div className="reservation-card">
          <span className="reservation-card__label">Quarto</span>
          <strong>{reservation.roomNumber}</strong>
          <p>{reservation.roomLabel}</p>
        </div>
        <div className="reservation-card">
          <span className="reservation-card__label">Período</span>
          <strong>{reservation.nights} noite(s)</strong>
          <p>{formatStayWindow(reservation.checkInDate, reservation.checkOutDate)}</p>
        </div>
      </div>

      <Separator.Root className="separator" decorative orientation="horizontal" />

      <div className="surface__content">
        <div className="contact-grid">
          <TextField
            id="guestPhone"
            inputMode="tel"
            label="Celular"
            onChange={(event) => onContactChange("phone", event.target.value)}
            placeholder="(11) 99999-9999"
            value={phone}
          />

          <TextField
            id="guestEmail"
            inputMode="email"
            label="E-mail"
            onChange={(event) => onContactChange("email", event.target.value)}
            placeholder="hospede@email.com"
            value={email}
          />

          <label className="check-card">
            <input
              checked={acceptedTerms}
              onChange={(event) => onToggleTerms(event.target.checked)}
              type="checkbox"
            />
            <div>
              <strong>Confirmo os dados e desejo concluir o check-in.</strong>
              <p>Seu acesso ficará válido até o checkout.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="surface__footer">
        <Button onClick={onBack} type="button" variant="ghost">
          Corrigir dados
        </Button>
        <Button disabled={isSubmitting} onClick={onConfirm} type="button">
          {isSubmitting ? "Emitindo credenciais..." : "Concluir check-in"}
        </Button>
      </div>
    </section>
  );
};
