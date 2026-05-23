"use client";

import { useState } from "react";
import { createCheckInExperience } from "@/composition/create-check-in-experience";
import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";
import {
  AccessRequest,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";
import type { IdentityFactor } from "@/presentation/components/reservation-lookup-form";

// Etapas visíveis da jornada do hóspede na interface do totem.
type Stage = "lookup" | "review" | "ready";

// Estado local do formulário que acompanha a busca e a emissão do acesso.
interface LookupFormState {
  reservationCode: string;
  document: string;
  birthDate: string;
  identityFactor: IdentityFactor;
  phone: string;
  email: string;
}

const initialLookupForm: LookupFormState = {
  reservationCode: "",
  document: "",
  birthDate: "",
  identityFactor: "document",
  phone: "",
  email: "",
};

// Contrato mínimo esperado dos casos de uso injetados no hook.
interface AsyncAction<Input, Output> {
  execute(input: Input): Promise<Output>;
}

interface CheckInFlowServices {
  findReservation: AsyncAction<ReservationLookup, Reservation | null>;
  confirmCheckIn: AsyncAction<string, Reservation>;
  issueGuestAccess: AsyncAction<AccessRequest, GuestAccess>;
}

type CheckInFlowServicesFactory = () => CheckInFlowServices;

// Constrói o payload de lookup levando em conta o segundo fator escolhido.
const buildLookupPayload = (form: LookupFormState): ReservationLookup => {
  const base: ReservationLookup = {
    code: form.reservationCode.trim(),
  };

  if (form.identityFactor === "document" && form.document.trim()) {
    base.document = form.document.trim();
  }

  if (form.identityFactor === "birthDate" && form.birthDate.trim()) {
    base.birthDate = form.birthDate.trim();
  }

  return base;
};

/**
 * Orquestra a jornada de self check-in no frontend.
 */
export const useCheckInFlow = (
  createServices: CheckInFlowServicesFactory = createCheckInExperience,
) => {
  const [services] = useState(() => createServices());
  const [stage, setStage] = useState<Stage>("lookup");
  const [lookupForm, setLookupForm] = useState<LookupFormState>(initialLookupForm);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [access, setAccess] = useState<GuestAccess | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isIssuingAccess, setIsIssuingAccess] = useState(false);

  const setLookupField = (
    field: Exclude<keyof LookupFormState, "identityFactor">,
    value: string,
  ) => {
    setLookupForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const setIdentityFactor = (factor: IdentityFactor) => {
    setLookupForm((current) => ({
      ...current,
      identityFactor: factor,
    }));
  };

  const lookupReservation = async () => {
    setError(null);
    setIsLookingUp(true);

    try {
      const nextReservation = await services.findReservation.execute(
        buildLookupPayload(lookupForm),
      );

      setReservation(nextReservation);
      setAccess(null);
      setAcceptedTerms(false);
      setStage("review");
    } catch (lookupError) {
      setReservation(null);
      setStage("lookup");
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "errors.lookupFailed",
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  const issueGuestAccess = async () => {
    if (!reservation) {
      return;
    }

    if (!acceptedTerms) {
      // Emitimos a chave de tradução; o componente resolve para a string final.
      setError("errors.termsNotAccepted");
      return;
    }

    setError(null);
    setIsIssuingAccess(true);

    try {
      const confirmedReservation = await services.confirmCheckIn.execute(
        reservation.id,
      );
      const nextAccess = await services.issueGuestAccess.execute({
        reservationId: reservation.id,
        phone: lookupForm.phone.trim() || undefined,
        email: lookupForm.email.trim() || undefined,
      });

      setReservation(confirmedReservation);
      setAccess(nextAccess);
      setStage("ready");
    } catch (issueError) {
      setError(
        issueError instanceof Error
          ? issueError.message
          : "errors.issueFailed",
      );
    } finally {
      setIsIssuingAccess(false);
    }
  };

  const restartJourney = () => {
    setStage("lookup");
    setLookupForm(initialLookupForm);
    setReservation(null);
    setAccess(null);
    setAcceptedTerms(false);
    setError(null);
    setIsLookingUp(false);
    setIsIssuingAccess(false);
  };

  const goBackToLookup = () => {
    setStage("lookup");
    setAccess(null);
    setError(null);
  };

  return {
    stage,
    reservation,
    access,
    error,
    acceptedTerms,
    lookupForm,
    isLookingUp,
    isIssuingAccess,
    setLookupField,
    setIdentityFactor,
    setAcceptedTerms,
    lookupReservation,
    issueGuestAccess,
    restartJourney,
    goBackToLookup,
  };
};
