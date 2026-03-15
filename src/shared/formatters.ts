// Formatadores compartilhados para manter datas da UI consistentes em pt-BR.
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Converte o intervalo da hospedagem em uma frase curta para exibição na UI.
 */
export const formatStayWindow = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${dateFormatter.format(startDate)} • ${timeFormatter.format(startDate)} até ${dateFormatter.format(endDate)} • ${timeFormatter.format(endDate)}`;
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
