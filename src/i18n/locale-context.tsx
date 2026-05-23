"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  Locale,
  MessageKey,
  SUPPORTED_LOCALES,
  messages,
} from "@/i18n/messages";

const STORAGE_KEY = "checkflex.locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  // Útil para mensagens que podem vir como chave de tradução ou texto cru
  // (por exemplo, erros que ora são emitidos pelo client, ora pelo servidor).
  translateMaybe: (value: string | null | undefined) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const interpolate = (template: string, vars?: Record<string, string | number>) => {
  if (!vars) {
    return template;
  }
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
};

// Lê uma chave aninhada ("section.subkey") em estilo dot-path para evitar
// repetição da estrutura de mensagens nos componentes.
const resolveMessage = (locale: Locale, key: string): string => {
  const [section, subkey] = key.split(".") as [keyof (typeof messages)[Locale], string];
  const dictionary = messages[locale];
  const sectionDictionary = (dictionary as Record<string, Record<string, string>>)[section];
  return sectionDictionary?.[subkey] ?? key;
};

const readStoredLocale = (): Locale => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }
  return DEFAULT_LOCALE;
};

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export const LocaleProvider = ({
  children,
  initialLocale,
}: LocaleProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale ?? DEFAULT_LOCALE,
  );

  // Restaura a preferência salva apenas no cliente para evitar mismatch de SSR.
  useEffect(() => {
    if (!initialLocale) {
      setLocaleState(readStoredLocale());
    }
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
      // Fire-and-forget: o totem fica usável mesmo se a API estiver offline.
      if (typeof fetch === "function") {
        void fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "language.changed",
            metadata: { locale: next },
          }),
        }).catch(() => undefined);
      }
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => interpolate(resolveMessage(locale, key), vars),
      translateMaybe: (raw) => {
        if (!raw) return "";
        // Heurística simples: chaves de tradução têm formato "section.key".
        if (/^[a-zA-Z]+(?:\.[a-zA-Z0-9]+)+$/.test(raw)) {
          const resolved = resolveMessage(locale, raw);
          // Se a chave existir no dicionário, devolve a tradução; senão, mantém o original.
          if (resolved !== raw) {
            return resolved;
          }
        }
        return raw;
      },
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useTranslation precisa estar dentro de LocaleProvider.");
  }
  return context;
};
