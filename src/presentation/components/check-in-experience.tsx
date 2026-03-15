"use client";

import { getCheckInSupportContent } from "@/composition/create-check-in-experience";
import { AccessReadyCard } from "@/presentation/components/access-ready-card";
import { ProgressRail } from "@/presentation/components/progress-rail";
import { ReservationLookupForm } from "@/presentation/components/reservation-lookup-form";
import { ReservationSummaryCard } from "@/presentation/components/reservation-summary-card";
import { SupportDialog } from "@/presentation/components/support-dialog";
import { useCheckInFlow } from "@/presentation/hooks/use-check-in-flow";

// Ordem visual das etapas exibidas ao hóspede.
const steps = [
  "Buscar reserva",
  "Revisar hospedagem",
  "Emitir credenciais",
];

// Conteúdo auxiliar independente da renderização do fluxo principal.
const supportContent = getCheckInSupportContent();

/**
 * Casca principal da experiência do totem.
 * Faz a ponte entre o hook de orquestração e os componentes visuais de cada etapa.
 */
export const CheckInExperience = () => {
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
    setLookupField,
    stage,
  } = useCheckInFlow();

  // Traduz o estágio atual para o índice usado pela barra de progresso.
  const currentStep = stage === "lookup" ? 0 : stage === "review" ? 1 : 2;

  return (
    <main className="kiosk-shell">
      <div className="ambient ambient--top" />
      <div className="ambient ambient--bottom" />

      <section className="top-bar">
        <div>
          <span className="eyebrow">CheckFlex</span>
          <h1 className="top-bar__title">Autoatendimento</h1>
        </div>

        <SupportDialog
          reservationCodeExamples={supportContent.reservationCodeExamples}
        />
      </section>

      <section className="workspace workspace--focused">
        <div className="workspace__main">
          <ProgressRail currentStep={currentStep} steps={steps} />

          {error ? (
            <div className="alert-banner" role="alert">
              {error}
            </div>
          ) : null}

          {stage === "lookup" ? (
            <ReservationLookupForm
              isLoading={isLookingUp}
              onChange={(field, value) => setLookupField(field, value)}
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
        </div>
      </section>
    </main>
  );
};
