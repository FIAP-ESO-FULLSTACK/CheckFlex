import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/i18n/locale-context";
import { Locale } from "@/i18n/messages";
import { ReservationSummaryCard } from "@/presentation/components/reservation-summary-card";
import { makeReservation } from "@/test/factories/check-in-test-data";

const renderCard = (locale: Locale) =>
  render(
    <LocaleProvider initialLocale={locale}>
      <ReservationSummaryCard
        acceptedTerms={false}
        email=""
        isSubmitting={false}
        onBack={vi.fn()}
        onConfirm={vi.fn().mockResolvedValue(undefined)}
        onContactChange={vi.fn()}
        onToggleTerms={vi.fn()}
        phone=""
        reservation={makeReservation()}
      />
    </LocaleProvider>,
  );

describe("ReservationSummaryCard i18n", () => {
  it("usa textos pt-BR", () => {
    renderCard("pt-BR");
    expect(screen.getByText("Confirme seus dados")).toBeDefined();
    expect(screen.getByText("Celular")).toBeDefined();
    expect(screen.getByRole("button", { name: /Concluir check-in/i })).toBeDefined();
  });

  it("traduz para inglês", () => {
    renderCard("en");
    expect(screen.getByText("Confirm your details")).toBeDefined();
    expect(screen.getByText("Mobile")).toBeDefined();
    expect(screen.getByRole("button", { name: /Complete check-in/i })).toBeDefined();
  });

  it("traduz para espanhol", () => {
    renderCard("es");
    expect(screen.getByText("Confirma tus datos")).toBeDefined();
    expect(screen.getByText("Habitación")).toBeDefined();
    expect(screen.getByRole("button", { name: /Completar check-in/i })).toBeDefined();
  });
});
