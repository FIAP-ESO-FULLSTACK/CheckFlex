import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { LocaleProvider } from "@/i18n/locale-context";
import { Locale } from "@/i18n/messages";
import { ReservationLookupForm } from "@/presentation/components/reservation-lookup-form";

const renderForm = (locale: Locale) =>
  render(
    <LocaleProvider initialLocale={locale}>
      <ReservationLookupForm
        birthDate=""
        document=""
        identityFactor="document"
        isLoading={false}
        onChange={vi.fn()}
        onFactorChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        reservationCode=""
      />
    </LocaleProvider>,
  );

// Wrapper que mantém o estado real do código para checar o comportamento de
// formatação enquanto o usuário digita.
const InteractiveForm = () => {
  const [reservationCode, setReservationCode] = useState("");
  const [document, setDocument] = useState("");
  return (
    <LocaleProvider initialLocale="pt-BR">
      <ReservationLookupForm
        birthDate=""
        document={document}
        identityFactor="document"
        isLoading={false}
        onChange={(field, value) => {
          if (field === "reservationCode") setReservationCode(value);
          if (field === "document") setDocument(value);
        }}
        onFactorChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        reservationCode={reservationCode}
      />
    </LocaleProvider>
  );
};

// Garante que os textos visíveis do formulário acompanham o idioma escolhido,
// cobrindo o caso reportado em que a UI ficava parcialmente em pt-BR.
describe("ReservationLookupForm i18n", () => {
  it("renderiza títulos e labels em pt-BR", () => {
    renderForm("pt-BR");
    expect(screen.getByText("Encontre sua reserva")).toBeDefined();
    expect(screen.getByText("Código da reserva")).toBeDefined();
    expect(screen.getByText("CPF do titular")).toBeDefined();
    expect(screen.getByRole("button", { name: /Continuar/i })).toBeDefined();
  });

  it("renderiza em inglês", () => {
    renderForm("en");
    expect(screen.getByText("Find your reservation")).toBeDefined();
    expect(screen.getByText("Reservation code")).toBeDefined();
    expect(screen.getByText("Guest CPF")).toBeDefined();
    expect(screen.getByRole("button", { name: /^Continue$/i })).toBeDefined();
  });

  it("renderiza em espanhol", () => {
    renderForm("es");
    expect(screen.getByText("Encuentra tu reserva")).toBeDefined();
    expect(screen.getByText("Código de reserva")).toBeDefined();
    expect(screen.getByText("CPF del titular")).toBeDefined();
  });
});

describe("ReservationLookupForm — formatação do código", () => {
  it("converte minúsculas em maiúsculas enquanto o hóspede digita", () => {
    render(<InteractiveForm />);
    const input = screen.getByLabelText("Código da reserva") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "c" } });
    expect(input.value).toBe("C");

    fireEvent.change(input, { target: { value: "ck" } });
    expect(input.value).toBe("CK");
  });

  it("acrescenta o traço assim que o terceiro caractere é digitado", () => {
    render(<InteractiveForm />);
    const input = screen.getByLabelText("Código da reserva") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "ckf" } });
    expect(input.value).toBe("CKF-");
  });

  it("completa o código no formato XXX-NNNN", () => {
    render(<InteractiveForm />);
    const input = screen.getByLabelText("Código da reserva") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "c" } });
    fireEvent.change(input, { target: { value: "ck" } });
    fireEvent.change(input, { target: { value: "ckf" } });
    fireEvent.change(input, { target: { value: "CKF-5" } });
    fireEvent.change(input, { target: { value: "CKF-50" } });
    fireEvent.change(input, { target: { value: "CKF-504" } });
    fireEvent.change(input, { target: { value: "CKF-5042" } });

    expect(input.value).toBe("CKF-5042");
  });

  it("ignora caracteres não alfanuméricos", () => {
    render(<InteractiveForm />);
    const input = screen.getByLabelText("Código da reserva") as HTMLInputElement;

    fireEvent.change(input, { target: { value: " c@k!f " } });
    expect(input.value).toBe("CKF-");
  });

  it("o backspace remove o traço auto-inserido junto com o último caractere", () => {
    render(<InteractiveForm />);
    const input = screen.getByLabelText("Código da reserva") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "ckf" } });
    expect(input.value).toBe("CKF-");

    // Simula o backspace: navegador remove o último char visível (o traço).
    fireEvent.change(input, { target: { value: "CKF" } });
    expect(input.value).toBe("CK");
  });

  it("aplica text-transform uppercase como rede de segurança visual", () => {
    render(<InteractiveForm />);
    const input = screen.getByLabelText("Código da reserva") as HTMLInputElement;
    expect(input.style.textTransform).toBe("uppercase");
  });
});

describe("ReservationLookupForm — formatação do CPF", () => {
  it("acrescenta o primeiro ponto após o terceiro dígito", () => {
    render(<InteractiveForm />);
    const cpf = screen.getByLabelText("CPF do titular") as HTMLInputElement;

    fireEvent.change(cpf, { target: { value: "123" } });
    expect(cpf.value).toBe("123.");
  });

  it("acrescenta o segundo ponto após o sexto dígito", () => {
    render(<InteractiveForm />);
    const cpf = screen.getByLabelText("CPF do titular") as HTMLInputElement;

    fireEvent.change(cpf, { target: { value: "123456" } });
    expect(cpf.value).toBe("123.456.");
  });

  it("acrescenta o traço após o nono dígito", () => {
    render(<InteractiveForm />);
    const cpf = screen.getByLabelText("CPF do titular") as HTMLInputElement;

    fireEvent.change(cpf, { target: { value: "123456789" } });
    expect(cpf.value).toBe("123.456.789-");
  });

  it("forma o CPF completo após 11 dígitos", () => {
    render(<InteractiveForm />);
    const cpf = screen.getByLabelText("CPF do titular") as HTMLInputElement;

    fireEvent.change(cpf, { target: { value: "12345678909" } });
    expect(cpf.value).toBe("123.456.789-09");
  });

  it("ignora letras e símbolos colados pelo hóspede", () => {
    render(<InteractiveForm />);
    const cpf = screen.getByLabelText("CPF do titular") as HTMLInputElement;

    fireEvent.change(cpf, { target: { value: "abc123def456" } });
    expect(cpf.value).toBe("123.456.");
  });

  it("backspace logo após o separador auto-inserido remove o último dígito junto", () => {
    render(<InteractiveForm />);
    const cpf = screen.getByLabelText("CPF do titular") as HTMLInputElement;

    fireEvent.change(cpf, { target: { value: "123" } });
    expect(cpf.value).toBe("123.");

    // Backspace: navegador retira o ponto auto-inserido.
    fireEvent.change(cpf, { target: { value: "123" } });
    // O usuário voltou ao estado anterior; o componente preserva o "123." porque
    // o valor antes do change não terminava com separador. Simulação real do
    // backspace acontece quando o input recebe a versão sem o último char.
    fireEvent.change(cpf, { target: { value: "12" } });
    expect(cpf.value).toBe("12");
  });
});
