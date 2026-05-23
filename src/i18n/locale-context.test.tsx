import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LocaleProvider, useTranslation } from "@/i18n/locale-context";

const Probe = () => {
  const { locale, setLocale, t } = useTranslation();
  return (
    <div>
      <span data-testid="title">{t("topBar.title")}</span>
      <span data-testid="greeting">
        {t("checkout.doneTitleTemplate", { name: "Marina" })}
      </span>
      <span data-testid="locale">{locale}</span>
      <button onClick={() => setLocale("en")} type="button">
        to-en
      </button>
      <button onClick={() => setLocale("es")} type="button">
        to-es
      </button>
    </div>
  );
};

describe("LocaleProvider + useTranslation", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("retorna mensagens em pt-BR por padrão", () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <Probe />
      </LocaleProvider>,
    );

    expect(screen.getByTestId("title").textContent).toBe("Autoatendimento");
    expect(screen.getByTestId("greeting").textContent).toBe("Boa viagem, Marina!");
  });

  it("troca dinamicamente para inglês e espanhol", () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <Probe />
      </LocaleProvider>,
    );

    act(() => {
      screen.getByText("to-en").click();
    });
    expect(screen.getByTestId("title").textContent).toBe("Self-service");
    expect(screen.getByTestId("greeting").textContent).toBe("Safe travels, Marina!");

    act(() => {
      screen.getByText("to-es").click();
    });
    expect(screen.getByTestId("title").textContent).toBe("Autoservicio");
    expect(screen.getByTestId("greeting").textContent).toBe("¡Buen viaje, Marina!");
  });

  it("translateMaybe resolve chave de erro e mantém texto cru intacto", () => {
    const Probe2 = () => {
      const { translateMaybe } = useTranslation();
      return (
        <div>
          <span data-testid="key">{translateMaybe("errors.termsNotAccepted")}</span>
          <span data-testid="raw">{translateMaybe("Erro do servidor X.")}</span>
          <span data-testid="empty">{translateMaybe(null)}</span>
        </div>
      );
    };

    render(
      <LocaleProvider initialLocale="en">
        <Probe2 />
      </LocaleProvider>,
    );

    expect(screen.getByTestId("key").textContent).toContain(
      "Please accept the operational terms",
    );
    expect(screen.getByTestId("raw").textContent).toBe("Erro do servidor X.");
    expect(screen.getByTestId("empty").textContent).toBe("");
  });

  it("persiste a escolha em localStorage", () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <Probe />
      </LocaleProvider>,
    );

    act(() => {
      screen.getByText("to-en").click();
    });

    expect(window.localStorage.getItem("checkflex.locale")).toBe("en");
  });
});
