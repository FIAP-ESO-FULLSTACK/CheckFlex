"use client";

import { useState } from "react";
import { createCheckInExperience } from "@/composition/create-check-in-experience";
import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";
import {
  AccessRequest,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";

// Etapas visíveis da jornada do hóspede na interface do totem.
type Stage = "lookup" | "review" | "ready";

// Estado local do formulário que acompanha a busca e a emissão do acesso.
interface LookupFormState {
  reservationCode: string;
  phone: string;
  email: string;
}

const initialLookupForm: LookupFormState = {
  reservationCode: "",
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

/**
 * Orquestra a jornada de self check-in no frontend.
 * Centraliza estado, transições de etapa e chamadas aos casos de uso para
 * que os componentes de apresentação permaneçam declarativos e desacoplados.
 */
export const useCheckInFlow = (
  createServices: CheckInFlowServicesFactory = createCheckInExperience,
) => {
  // A composição fica isolada aqui para a UI depender só de casos de uso.
  const [services] = useState(() => createServices());
  const [stage, setStage] = useState<Stage>("lookup");
  const [lookupForm, setLookupForm] = useState<LookupFormState>(initialLookupForm);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [access, setAccess] = useState<GuestAccess | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isIssuingAccess, setIsIssuingAccess] = useState(false);

  const setLookupField = (field: keyof LookupFormState, value: string) => {
    setLookupForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // Localiza a reserva e avança a UI para a etapa de revisão.
  const lookupReservation = async () => {
    setError(null);
    setIsLookingUp(true);

    try {
      const nextReservation = await services.findReservation.execute({
        code: lookupForm.reservationCode,
      });

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
          : "Falha ao buscar a reserva.",
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  // Confirma o check-in e emite a credencial temporária do hóspede.
  const issueGuestAccess = async () => {
    if (!reservation) {
      return;
    }

    if (!acceptedTerms) {
      setError("Confirme os termos operacionais antes de concluir o check-in.");
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
          : "Falha ao emitir as credenciais do hóspede.",
      );
    } finally {
      setIsIssuingAccess(false);
    }
  };

  // Reinicia o atendimento para um novo hóspede.
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

  // Permite voltar à busca mantendo o formulário de contato disponível para ajuste.
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
    setAcceptedTerms,
    lookupReservation,
    issueGuestAccess,
    restartJourney,
    goBackToLookup,
  };
};
