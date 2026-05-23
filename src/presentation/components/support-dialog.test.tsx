import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/i18n/locale-context";
import { SupportDialog } from "@/presentation/components/support-dialog";

// Garante que o modal de ajuda exponha os códigos da demonstração ao usuário
// e que o idioma ativo controle os textos do diálogo.
describe("SupportDialog", () => {
  it("mostra exemplos de códigos de reserva ao abrir a ajuda (pt-BR)", () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <SupportDialog reservationCodeExamples={["CKF-5042", "CKF-2128"]} />
      </LocaleProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /precisa de ajuda/i }));

    expect(screen.getByText("CKF-5042")).toBeDefined();
    expect(screen.getByText("CKF-2128")).toBeDefined();
    expect(screen.getByText("Ajuda rápida")).toBeDefined();
  });

  it("traduz os textos quando o idioma é inglês", () => {
    render(
      <LocaleProvider initialLocale="en">
        <SupportDialog reservationCodeExamples={["CKF-5042"]} />
      </LocaleProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /need help/i }));
    expect(screen.getByText("Quick help")).toBeDefined();
  });
});
