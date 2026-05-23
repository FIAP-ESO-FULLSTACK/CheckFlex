import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/i18n/locale-context";
import { EmailConfirmationToast } from "@/presentation/components/email-confirmation-toast";

const renderToast = (visible: boolean, onDismiss = vi.fn()) =>
  render(
    <LocaleProvider initialLocale="pt-BR">
      <EmailConfirmationToast
        durationMs={1500}
        onDismiss={onDismiss}
        visible={visible}
      />
    </LocaleProvider>,
  );

describe("EmailConfirmationToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("não renderiza nada quando visível é falso", () => {
    renderToast(false);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("exibe a mensagem traduzida quando visível", () => {
    renderToast(true);
    expect(screen.getByText("Confirmação enviada para o seu e-mail")).toBeDefined();
  });

  it("dispara onDismiss após o tempo configurado", () => {
    const onDismiss = vi.fn();
    renderToast(true, onDismiss);
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
