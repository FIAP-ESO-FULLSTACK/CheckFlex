"use client";

import { CheckCircledIcon, IdCardIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/locale-context";
import { Button } from "@/presentation/components/ui/button";
import { EmailConfirmationToast } from "@/presentation/components/email-confirmation-toast";
import { ReservationLookupForm } from "@/presentation/components/reservation-lookup-form";
import { useCheckoutFlow } from "@/presentation/hooks/use-checkout-flow";

// Estágios visuais do check-out depois que o backend devolve o resultado.
// "form" mantém o formulário inicial; os demais conduzem a apresentação.
type CheckoutStage = "form" | "review" | "tap" | "loading" | "toast" | "done";

// Tempos calibrados para a apresentação. O check-out é "um pouquinho mais
// lento" que o check-in (5s tap / 3.4s loading vs 4s/3s).
const REVIEW_DURATION_MS = 1800;
const TAP_DURATION_MS = 5000;
const LOADING_DURATION_MS = 3400;
const TOAST_DURATION_MS = 1500;

/**
 * Fluxo de check-out no totem.
 * Após o submit, conduz uma sequência narrativa: revisão da credencial,
 * leitura simulada do cartão RFID, confirmação por e-mail e despedida.
 */
export const CheckoutExperience = ({ onExit }: { onExit: () => void }) => {
  const { t, translateMaybe } = useTranslation();
  const {
    error,
    isProcessing,
    lookupForm,
    result,
    resetCheckout,
    runCheckout,
    setIdentityFactor,
    setLookupField,
  } = useCheckoutFlow();

  const [stage, setStage] = useState<CheckoutStage>("form");

  // Quando o backend devolve o resultado, deixamos a UI ditar o ritmo das
  // próximas telas. Cada timer avança o estágio até a despedida final.
  useEffect(() => {
    if (!result) {
      setStage("form");
      return;
    }
    setStage("review");
    const toTap = setTimeout(() => setStage("tap"), REVIEW_DURATION_MS);
    const toLoading = setTimeout(
      () => setStage("loading"),
      REVIEW_DURATION_MS + TAP_DURATION_MS,
    );
    const toToast = setTimeout(
      () => setStage("toast"),
      REVIEW_DURATION_MS + TAP_DURATION_MS + LOADING_DURATION_MS,
    );
    const toDone = setTimeout(
      () => setStage("done"),
      REVIEW_DURATION_MS +
        TAP_DURATION_MS +
        LOADING_DURATION_MS +
        TOAST_DURATION_MS,
    );
    return () => {
      clearTimeout(toTap);
      clearTimeout(toLoading);
      clearTimeout(toToast);
      clearTimeout(toDone);
    };
  }, [result]);

  const handleFinish = () => {
    resetCheckout();
    setStage("form");
    onExit();
  };

  if (result && stage !== "form") {
    const firstName = result.reservation.guestFullName.split(" ")[0];
    const access = result.revokedAccess;
    const cardLabel = access
      ? t("checkout.cardNumberTemplate", { pin: access.pin })
      : null;
    const notificationEmail = access?.notificationEmail ?? null;

    return (
      <div className="checkout-shell">
        <EmailConfirmationToast
          durationMs={TOAST_DURATION_MS}
          email={notificationEmail ?? undefined}
          onDismiss={() => {
            // O timer principal controla a transição; mantemos o handler vazio
            // para o componente do toast seguir desacoplado.
          }}
          visible={stage === "toast"}
        />

        {stage === "done" ? (
          <section className="surface surface--success" role="status">
            <div className="surface__header">
              <div>
                <span className="eyebrow">{t("checkout.farewellEyebrow")}</span>
                <h2>
                  {t("checkout.farewellTitleTemplate", { name: firstName })}
                </h2>
              </div>
              <div className="icon-badge icon-badge--success">
                <CheckCircledIcon />
              </div>
            </div>
            <div className="surface__content">
              <p className="soft-note">{t("checkout.farewellMessage")}</p>
            </div>
            <div className="surface__footer">
              <Button onClick={handleFinish} variant="primary">
                {t("checkout.back")}
              </Button>
            </div>
          </section>
        ) : (
          <section className="surface surface--feature" role="status">
            <div className="surface__header">
              <div>
                <span className="eyebrow">{t("checkout.reviewEyebrow")}</span>
                <h2>{result.reservation.guestFullName}</h2>
                {cardLabel ? (
                  <p className="checkout-card-label">{cardLabel}</p>
                ) : null}
              </div>
              <div className="icon-badge">
                <IdCardIcon />
              </div>
            </div>

            {(stage === "tap" || stage === "loading") && (
              <div
                aria-live="polite"
                className={`rfid-block rfid-block--${stage}`}
                role="status"
              >
                <div className="rfid-block__visual" aria-hidden="true">
                  {stage === "tap" ? (
                    <IdCardIcon className="rfid-block__icon" />
                  ) : (
                    <span className="rfid-spinner" />
                  )}
                </div>
                <div className="rfid-block__text">
                  {stage === "tap" ? (
                    <>
                      <strong>{t("checkout.rfidTap")}</strong>
                      <span>{t("checkout.rfidTapHint")}</span>
                    </>
                  ) : (
                    <strong>{t("checkout.rfidLoading")}</strong>
                  )}
                </div>
              </div>
            )}

            {stage === "review" ? (
              <div className="surface__content">
                <p className="soft-note">{t("checkout.reviewTitle")}</p>
              </div>
            ) : null}
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="checkout-shell">
      {error ? (
        <div className="alert-banner" role="alert">
          {translateMaybe(error)}
        </div>
      ) : null}

      <ReservationLookupForm
        birthDate={lookupForm.birthDate}
        document={lookupForm.document}
        identityFactor={lookupForm.identityFactor}
        isLoading={isProcessing}
        onChange={(field, value) => setLookupField(field, value)}
        onFactorChange={setIdentityFactor}
        onSubmit={runCheckout}
        reservationCode={lookupForm.reservationCode}
      />

      <div className="checkout-shell__footer">
        <Button onClick={onExit} variant="ghost">
          {t("checkout.cancel")}
        </Button>
      </div>
    </div>
  );
};
