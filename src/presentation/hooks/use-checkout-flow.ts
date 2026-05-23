"use client";

import { useState } from "react";
import {
  CheckoutResult,
  ReservationLookup,
} from "@/domain/repositories/check-in-repository";
import type { IdentityFactor } from "@/presentation/components/reservation-lookup-form";

interface CheckoutFormState {
  reservationCode: string;
  document: string;
  birthDate: string;
  identityFactor: IdentityFactor;
}

const initialForm: CheckoutFormState = {
  reservationCode: "",
  document: "",
  birthDate: "",
  identityFactor: "document",
};

// Contrato simples consumido pelo hook. A implementação default usa fetch,
// mas os testes injetam um mock para evitar tocar na rede.
export interface CheckoutService {
  execute(input: ReservationLookup): Promise<CheckoutResult>;
}

const defaultService: CheckoutService = {
  async execute(input) {
    const response = await fetch("/api/check-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = (await response.json().catch(() => ({}))) as
      | CheckoutResult
      | { error: string };

    if (!response.ok) {
      throw new Error(
        "error" in payload && payload.error
          ? payload.error
          : "Falha ao concluir o check-out.",
      );
    }

    return payload as CheckoutResult;
  },
};

const buildPayload = (form: CheckoutFormState): ReservationLookup => {
  const payload: ReservationLookup = { code: form.reservationCode.trim() };
  if (form.identityFactor === "document" && form.document.trim()) {
    payload.document = form.document.trim();
  }
  if (form.identityFactor === "birthDate" && form.birthDate.trim()) {
    payload.birthDate = form.birthDate.trim();
  }
  return payload;
};

/**
 * Coordena o check-out simples no totem.
 * Mantém o mesmo padrão visual do check-in para manter a UI declarativa.
 */
export const useCheckoutFlow = (service: CheckoutService = defaultService) => {
  const [lookupForm, setLookupForm] = useState<CheckoutFormState>(initialForm);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const setLookupField = (
    field: Exclude<keyof CheckoutFormState, "identityFactor">,
    value: string,
  ) => {
    setLookupForm((current) => ({ ...current, [field]: value }));
  };

  const setIdentityFactor = (factor: IdentityFactor) => {
    setLookupForm((current) => ({ ...current, identityFactor: factor }));
  };

  const runCheckout = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const checkoutResult = await service.execute(buildPayload(lookupForm));
      setResult(checkoutResult);
    } catch (issue) {
      setResult(null);
      setError(
        issue instanceof Error ? issue.message : "errors.checkoutFailed",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCheckout = () => {
    setLookupForm(initialForm);
    setResult(null);
    setError(null);
    setIsProcessing(false);
  };

  return {
    error,
    isProcessing,
    lookupForm,
    result,
    resetCheckout,
    runCheckout,
    setIdentityFactor,
    setLookupField,
  };
};
