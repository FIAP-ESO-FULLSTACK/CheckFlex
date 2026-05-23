import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/i18n/locale-context";
import { RfidSimulation } from "@/presentation/components/rfid-simulation";

const renderSimulation = () =>
  render(
    <LocaleProvider initialLocale="pt-BR">
      <RfidSimulation tapDurationMs={1000} loadingDurationMs={500} />
    </LocaleProvider>,
  );

describe("RfidSimulation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("inicia pedindo para aproximar o cartão", () => {
    renderSimulation();
    expect(screen.getByText("Aproxime seu cartão do leitor")).toBeDefined();
  });

  it("avança para o estado de carregamento após o intervalo de leitura", () => {
    renderSimulation();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Carregando credenciais...")).toBeDefined();
  });

  it("finaliza com o cartão pronto para uso", () => {
    renderSimulation();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText("Seu cartão está pronto para uso")).toBeDefined();
  });

  it("limpa os timers ao desmontar para evitar transição depois do unmount", () => {
    const { unmount } = renderSimulation();
    unmount();
    // Sem assert direto: se a limpeza falhar, vitest acusa pendentes ao terminar.
    expect(vi.getTimerCount()).toBe(0);
  });
});
