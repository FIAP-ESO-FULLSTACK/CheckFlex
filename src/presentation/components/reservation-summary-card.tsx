"use client";
import * as Separator from "@radix-ui/react-separator";
import { CheckIcon } from "@radix-ui/react-icons";
import { Reservation } from "@/domain/entities/reservation";
import { useTranslation } from "@/i18n/locale-context";
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
  const { locale, t } = useTranslation();

  return (
    <section className="surface surface--feature">
      <div className="surface__header">
        <div>
          <span className="eyebrow">{t("review.stage")}</span>
          <h2>{t("review.title")}</h2>
        </div>
        <div className="icon-badge icon-badge--success">
          <CheckIcon />
        </div>
      </div>

      <div className="reservation-grid">
        <div className="reservation-card">
          <span className="reservation-card__label">{t("review.name")}</span>
          <strong>{reservation.guestFullName}</strong>
          <p>{reservation.propertyName}</p>
        </div>
        <div className="reservation-card">
          <span className="reservation-card__label">{t("review.room")}</span>
          <strong>{reservation.roomNumber}</strong>
          <p>{reservation.roomLabel}</p>
        </div>
        <div className="reservation-card">
          <span className="reservation-card__label">{t("review.period")}</span>
          <strong>
            {t("review.nightsTemplate", { count: reservation.nights })}
          </strong>
          <p>
            {formatStayWindow(
              reservation.checkInDate,
              reservation.checkOutDate,
              locale,
              t("ready.stayUntil"),
            )}
          </p>
        </div>
      </div>

      <Separator.Root className="separator" decorative orientation="horizontal" />

      <div className="surface__content">
        <div className="contact-grid">
          <TextField
            id="guestPhone"
            inputMode="tel"
            label={t("review.phoneLabel")}
            onChange={(event) => onContactChange("phone", event.target.value)}
            placeholder={t("review.phonePlaceholder")}
            value={phone}
          />

          <TextField
            id="guestEmail"
            inputMode="email"
            label={t("review.emailLabel")}
            onChange={(event) => onContactChange("email", event.target.value)}
            placeholder={t("review.emailPlaceholder")}
            value={email}
          />

          <label className="check-card">
            <input
              checked={acceptedTerms}
              onChange={(event) => onToggleTerms(event.target.checked)}
              type="checkbox"
            />
            <div>
              <strong>{t("review.termsLabel")}</strong>
              <p>{t("review.termsHint")}</p>
            </div>
          </label>
        </div>
      </div>

      <div className="surface__footer">
        <Button onClick={onBack} type="button" variant="ghost">
          {t("review.back")}
        </Button>
        <Button disabled={isSubmitting} onClick={onConfirm} type="button">
          {isSubmitting ? t("review.submitting") : t("review.submit")}
        </Button>
      </div>
    </section>
  );
};
