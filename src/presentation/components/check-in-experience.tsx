"use client";

import { useEffect, useState } from "react";
import { getCheckInSupportContent } from "@/composition/create-check-in-experience";
import { useTranslation } from "@/i18n/locale-context";
import { AccessReadyCard } from "@/presentation/components/access-ready-card";
import { CheckoutExperience } from "@/presentation/components/checkout-experience";
import { EmailConfirmationToast } from "@/presentation/components/email-confirmation-toast";
import { LanguageSwitch } from "@/presentation/components/language-switch";
import { ProgressRail } from "@/presentation/components/progress-rail";
import { ReservationLookupForm } from "@/presentation/components/reservation-lookup-form";
import { ReservationSummaryCard } from "@/presentation/components/reservation-summary-card";
import { SupportDialog } from "@/presentation/components/support-dialog";
import { useCheckInFlow } from "@/presentation/hooks/use-check-in-flow";

// Conteúdo auxiliar independente da renderização do fluxo principal.
const supportContent = getCheckInSupportContent();

type Journey = "check-in" | "check-out";

/**
 * Casca principal da experiência do totem.
 * Alterna entre as jornadas de check-in e check-out, mantendo o mesmo
 * cabeçalho e os mesmos componentes visuais para uma identidade consistente.
 */
export const CheckInExperience = () => {
  const { t, translateMaybe } = useTranslation();
  const [journey, setJourney] = useState<Journey>("check-in");
  const [emailToastVisible, setEmailToastVisible] = useState(false);
  const steps = [t("steps.lookup"), t("steps.review"), t("steps.issue")];

  const {
    access,
    acceptedTerms,
    error,
    goBackToLookup,
    isIssuingAccess,
    isLookingUp,
    issueGuestAccess,
    lookupForm,
    lookupReservation,
    reservation,
    restartJourney,
    setAcceptedTerms,
    setIdentityFactor,
    setLookupField,
    stage,
  } = useCheckInFlow();

  const currentStep = stage === "lookup" ? 0 : stage === "review" ? 1 : 2;
  const hasEmail = lookupForm.email.trim().length > 0;

  // Mostra o toast central quando o check-in conclui e há e-mail informado.
  // O auto-dismiss do toast acontece dentro do próprio componente.
  useEffect(() => {
    if (stage === "ready" && hasEmail) {
      setEmailToastVisible(true);
    }
  }, [stage, hasEmail]);

  const switchTo = (next: Journey) => {
    setJourney(next);
  };

  return (
    <main className="kiosk-shell">
      <EmailConfirmationToast
        email={lookupForm.email.trim() || undefined}
        onDismiss={() => setEmailToastVisible(false)}
        visible={emailToastVisible}
      />
      <div className="ambient ambient--top" />
      <div className="ambient ambient--bottom" />

      <section className="top-bar">
        <div>
          <span className="eyebrow">{t("topBar.eyebrow")}</span>
          <h1 className="top-bar__title">{t("topBar.title")}</h1>
        </div>

        <div className="top-bar__actions">
          <div className="journey-switch" role="tablist">
            <button
              aria-selected={journey === "check-in"}
              className={`journey-switch__option${
                journey === "check-in" ? " journey-switch__option--active" : ""
              }`}
              onClick={() => switchTo("check-in")}
              role="tab"
              type="button"
            >
              {t("topBar.checkIn")}
            </button>
            <button
              aria-selected={journey === "check-out"}
              className={`journey-switch__option${
                journey === "check-out" ? " journey-switch__option--active" : ""
              }`}
              onClick={() => switchTo("check-out")}
              role="tab"
              type="button"
            >
              {t("topBar.checkOut")}
            </button>
          </div>
          <LanguageSwitch />
          <SupportDialog
            reservationCodeExamples={supportContent.reservationCodeExamples}
          />
        </div>
      </section>

      <section className="workspace workspace--focused">
        <div className="workspace__main">
          {journey === "check-in" ? (
            <>
              <ProgressRail currentStep={currentStep} steps={steps} />

              {error ? (
                <div className="alert-banner" role="alert">
                  {translateMaybe(error)}
                </div>
              ) : null}

              {stage === "lookup" ? (
                <ReservationLookupForm
                  birthDate={lookupForm.birthDate}
                  document={lookupForm.document}
                  identityFactor={lookupForm.identityFactor}
                  isLoading={isLookingUp}
                  onChange={(field, value) => setLookupField(field, value)}
                  onFactorChange={setIdentityFactor}
                  onSubmit={lookupReservation}
                  reservationCode={lookupForm.reservationCode}
                />
              ) : null}

              {stage === "review" && reservation ? (
                <ReservationSummaryCard
                  acceptedTerms={acceptedTerms}
                  email={lookupForm.email}
                  isSubmitting={isIssuingAccess}
                  onBack={goBackToLookup}
                  onConfirm={issueGuestAccess}
                  onContactChange={(field, value) => setLookupField(field, value)}
                  onToggleTerms={setAcceptedTerms}
                  phone={lookupForm.phone}
                  reservation={reservation}
                />
              ) : null}

              {stage === "ready" && access ? (
                <AccessReadyCard access={access} onRestart={restartJourney} />
              ) : null}
            </>
          ) : (
            <CheckoutExperience onExit={() => switchTo("check-in")} />
          )}
        </div>
      </section>
    </main>
  );
};
