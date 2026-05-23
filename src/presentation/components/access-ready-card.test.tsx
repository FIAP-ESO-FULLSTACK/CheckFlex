import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/i18n/locale-context";
import { Locale } from "@/i18n/messages";
import { AccessReadyCard } from "@/presentation/components/access-ready-card";
import { makeGuestAccess } from "@/test/factories/check-in-test-data";

const renderCard = (locale: Locale) =>
  render(
    <LocaleProvider initialLocale={locale}>
      <AccessReadyCard access={makeGuestAccess()} onRestart={vi.fn()} />
    </LocaleProvider>,
  );

describe("AccessReadyCard i18n", () => {
  it("mostra textos pt-BR", () => {
    renderCard("pt-BR");
    expect(screen.getByText("Seu acesso está pronto")).toBeDefined();
    expect(screen.getByText("PIN temporário")).toBeDefined();
    expect(screen.getByText("Chave digital")).toBeDefined();
    expect(screen.getByText("Até o checkout")).toBeDefined();
  });

  it("mostra textos em inglês", () => {
    renderCard("en");
    expect(screen.getByText("Your access is ready")).toBeDefined();
    expect(screen.getByText("Temporary PIN")).toBeDefined();
    expect(screen.getByText("Digital key")).toBeDefined();
    expect(screen.getByText("Until checkout")).toBeDefined();
  });

  it("mostra textos em espanhol", () => {
    renderCard("es");
    expect(screen.getByText("Tu acceso está listo")).toBeDefined();
    expect(screen.getByText("PIN temporal")).toBeDefined();
    expect(screen.getByText("Llave digital")).toBeDefined();
    expect(screen.getByText("Hasta el check-out")).toBeDefined();
  });
});
