import { ConfirmCheckInUseCase } from "@/application/use-cases/confirm-check-in-use-case";
import { FindReservationUseCase } from "@/application/use-cases/find-reservation-use-case";
import { IssueGuestAccessUseCase } from "@/application/use-cases/issue-guest-access-use-case";
import { HttpCheckInRepository } from "@/infrastructure/repositories/http-check-in-repository";

/**
 * Conteúdo auxiliar usado pela camada de apresentação para orientar a
 * demonstração do fluxo sem expor detalhes da infraestrutura.
 */
interface CheckInSupportContent {
  reservationCodeExamples: string[];
}

// Códigos pré-cadastrados pelo seed, expostos à UI apenas como dica visual.
const DEMO_CODES = ["CKF-5042", "CKF-2128"];

export const getCheckInSupportContent = (): CheckInSupportContent => ({
  reservationCodeExamples: [...DEMO_CODES],
});

/**
 * Composição principal da jornada de check-in.
 * Centraliza a criação das dependências para manter a UI desacoplada da
 * infraestrutura concreta.
 */
export const createCheckInExperience = () => {
  // A UI roda no navegador, então o repositório é sempre o adapter HTTP.
  const repository = new HttpCheckInRepository();

  return {
    findReservation: new FindReservationUseCase(repository),
    confirmCheckIn: new ConfirmCheckInUseCase(repository),
    issueGuestAccess: new IssueGuestAccessUseCase(repository),
  };
};
