// Cache pequeno para evitar instanciar o Intl.DateTimeFormat a cada render.
const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (
  locale: string,
  options: Intl.DateTimeFormatOptions,
) => {
  const key = `${locale}|${JSON.stringify(options)}`;
  const cached = formatterCache.get(key);
  if (cached) {
    return cached;
  }
  const formatter = new Intl.DateTimeFormat(locale, options);
  formatterCache.set(key, formatter);
  return formatter;
};

/**
 * Converte o intervalo da hospedagem em uma frase curta para a UI.
 * Aceita o locale ativo para que datas e separadores acompanhem o idioma do totem.
 */
export const formatStayWindow = (
  start: string,
  end: string,
  locale: string = "pt-BR",
  separatorWord: string = "até",
) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateFormatter = getFormatter(locale, {
    day: "2-digit",
    month: "short",
  });
  const timeFormatter = getFormatter(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateFormatter.format(startDate)} • ${timeFormatter.format(startDate)} ${separatorWord} ${dateFormatter.format(endDate)} • ${timeFormatter.format(endDate)}`;
};

/**
 * Oculta parte do telefone para exibir o destino da chave digital com mais privacidade.
 */
export const maskPhone = (value: string) => {
  const numbersOnly = value.replace(/\D/g, "");

  if (numbersOnly.length < 4) {
    return value;
  }

  return `(${numbersOnly.slice(0, 2)}) *****-${numbersOnly.slice(-4)}`;
};

/**
 * Formata o código de reserva no padrão `XXX-NNNN` enquanto o hóspede digita.
 * Aceita apenas letras/dígitos e insere o traço automaticamente assim que o
 * prefixo de três caracteres está completo, para o totem não exigir o
 * separador. A correção de "backspace sobre o traço" fica no componente do
 * formulário, onde temos acesso ao valor anterior do input.
 */
export const formatReservationCode = (raw: string) => {
  const sanitized = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (sanitized.length < 3) {
    return sanitized;
  }

  if (sanitized.length === 3) {
    return `${sanitized}-`;
  }

  return `${sanitized.slice(0, 3)}-${sanitized.slice(3, 11)}`;
};

/**
 * Formata o CPF no padrão `000.000.000-00` enquanto o hóspede digita.
 * Insere o separador (".", ".", "-") automaticamente assim que o bloco
 * correspondente é completado, igual ao código de reserva. Aceita só dígitos.
 */
export const formatCpf = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const length = digits.length;
  let out = digits.slice(0, 3);

  if (length >= 3) out += ".";
  out += digits.slice(3, 6);
  if (length >= 6) out += ".";
  out += digits.slice(6, 9);
  if (length >= 9) out += "-";
  out += digits.slice(9, 11);

  return out;
};
