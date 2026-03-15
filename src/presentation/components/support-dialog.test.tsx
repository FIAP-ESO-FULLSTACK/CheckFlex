import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SupportDialog } from "@/presentation/components/support-dialog";

// Garante que o modal de ajuda exponha os códigos da demonstração ao usuário.
describe("SupportDialog", () => {
  it("mostra exemplos de códigos de reserva ao abrir a ajuda", () => {
    render(
      <SupportDialog reservationCodeExamples={["CKF-5042", "CKF-2128"]} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /precisa de ajuda/i }));

    expect(screen.getByText("CKF-5042")).toBeDefined();
    expect(screen.getByText("CKF-2128")).toBeDefined();
  });
});
