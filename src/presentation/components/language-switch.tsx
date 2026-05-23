"use client";

import { Locale, SUPPORTED_LOCALES } from "@/i18n/messages";
import { useTranslation } from "@/i18n/locale-context";

// Mapeia o locale para uma sigla curta exibida no topo do totem.
const LABELS: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
  es: "ES",
};

/**
 * Seletor de idioma minimalista exibido no topo do totem.
 * Usa a paleta da journey-switch para manter coerência visual.
 */
export const LanguageSwitch = () => {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div
      aria-label={t("topBar.languageLabel")}
      className="journey-switch"
      role="radiogroup"
    >
      {SUPPORTED_LOCALES.map((option) => (
        <button
          aria-checked={locale === option}
          className={`journey-switch__option${
            locale === option ? " journey-switch__option--active" : ""
          }`}
          key={option}
          onClick={() => setLocale(option)}
          role="radio"
          type="button"
        >
          {LABELS[option]}
        </button>
      ))}
    </div>
  );
};
