"use client";

import { ArrowRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { FormEvent } from "react";
import { useTranslation } from "@/i18n/locale-context";
import { Button } from "@/presentation/components/ui/button";
import { TextField } from "@/presentation/components/ui/text-field";
import { formatCpf, formatReservationCode } from "@/shared/formatters";

// Caracteres inseridos pelo próprio formatter quando o último bloco é completado.
const AUTO_SEPARATORS = new Set([".", "-"]);

export type LookupFormField = "reservationCode" | "document" | "birthDate";
export type IdentityFactor = "document" | "birthDate";

interface ReservationLookupFormProps {
  reservationCode: string;
  document: string;
  birthDate: string;
  identityFactor: IdentityFactor;
  isLoading: boolean;
  onChange: (field: LookupFormField, value: string) => void;
  onFactorChange: (factor: IdentityFactor) => void;
  onSubmit: () => Promise<void>;
}

/**
 * Formulário inicial do totem.
 * Combina o código da reserva com um segundo fator de identidade (CPF ou data
 * de nascimento) conforme decisão registrada em AGENTS.md.
 */
export const ReservationLookupForm = ({
  reservationCode,
  document,
  birthDate,
  identityFactor,
  isLoading,
  onChange,
  onFactorChange,
  onSubmit,
}: ReservationLookupFormProps) => {
  const { t } = useTranslation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  const factorOptions: Array<{ value: IdentityFactor; label: string; hint: string }> = [
    {
      value: "document",
      label: t("lookup.factorDocument"),
      hint: t("lookup.factorDocumentHint"),
    },
    {
      value: "birthDate",
      label: t("lookup.factorBirthDate"),
      hint: t("lookup.factorBirthDateHint"),
    },
  ];

  return (
    <form className="surface surface--feature" onSubmit={handleSubmit}>
      <div className="surface__header">
        <div>
          <span className="eyebrow">{t("lookup.stage")}</span>
          <h2>{t("lookup.title")}</h2>
        </div>
        <div className="icon-badge">
          <MagnifyingGlassIcon />
        </div>
      </div>

      <div className="surface__content">
        <TextField
          autoCapitalize="characters"
          autoComplete="off"
          id="reservationCode"
          label={t("lookup.reservationCodeLabel")}
          maxLength={8}
          onChange={(event) => {
            const next = event.target.value;
            // Quando o hóspede aperta backspace e o cursor está logo após
            // o traço auto-inserido, removemos também o último caractere
            // alfanumérico para que a deleção pareça natural.
            if (
              reservationCode.endsWith("-") &&
              next === reservationCode.slice(0, -1)
            ) {
              onChange("reservationCode", next.slice(0, -1));
              return;
            }
            onChange("reservationCode", formatReservationCode(next));
          }}
          placeholder={t("lookup.reservationCodePlaceholder")}
          required
          spellCheck={false}
          // Garante feedback visual instantâneo (sem flash em minúsculo)
          // mesmo se o navegador renderizar antes do React aplicar o setState.
          style={{ textTransform: "uppercase" }}
          value={reservationCode}
        />

        <fieldset className="factor-group">
          <legend className="factor-group__legend">
            {t("lookup.identityLegend")}
          </legend>
          <div className="factor-group__options" role="radiogroup">
            {factorOptions.map((option) => (
              <label
                className={`factor-option${
                  identityFactor === option.value ? " factor-option--active" : ""
                }`}
                key={option.value}
              >
                <input
                  checked={identityFactor === option.value}
                  name="identityFactor"
                  onChange={() => onFactorChange(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span className="factor-option__label">{option.label}</span>
                <span className="factor-option__hint">{option.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {identityFactor === "document" ? (
          <TextField
            autoComplete="off"
            id="document"
            inputMode="numeric"
            label={t("lookup.documentLabel")}
            maxLength={14}
            onChange={(event) => {
              const next = event.target.value;
              // Backspace logo após o separador auto-inserido: também solta o
              // último dígito para o usuário não ficar "preso" no separador.
              const lastChar = document.slice(-1);
              if (
                AUTO_SEPARATORS.has(lastChar) &&
                next === document.slice(0, -1)
              ) {
                onChange("document", formatCpf(next.slice(0, -1)));
                return;
              }
              onChange("document", formatCpf(next));
            }}
            placeholder={t("lookup.documentPlaceholder")}
            required
            value={document}
          />
        ) : (
          <TextField
            autoComplete="off"
            id="birthDate"
            label={t("lookup.birthDateLabel")}
            onChange={(event) => onChange("birthDate", event.target.value)}
            placeholder={t("lookup.birthDatePlaceholder")}
            required
            type="text"
            value={birthDate}
          />
        )}
      </div>

      <div className="surface__footer">
        <p className="soft-note">{t("lookup.hint")}</p>

        <Button disabled={isLoading} type="submit">
          {isLoading ? t("lookup.submitting") : t("lookup.submit")}
          <ArrowRightIcon />
        </Button>
      </div>
    </form>
  );
};
