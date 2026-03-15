import { ConfirmCheckInUseCase } from "@/application/use-cases/confirm-check-in-use-case";
import { FindReservationUseCase } from "@/application/use-cases/find-reservation-use-case";
import { IssueGuestAccessUseCase } from "@/application/use-cases/issue-guest-access-use-case";
import {
  MockCheckInRepository,
  mockReservationCodeExamples,
} from "@/infrastructure/mocks/mock-check-in-repository";

/**
 * Conteúdo auxiliar usado pela camada de apresentação para orientar a
 * demonstração do fluxo sem expor detalhes da infraestrutura.
 */
interface CheckInSupportContent {
  reservationCodeExamples: string[];
}

/**
 * Entrega dados de suporte consumidos pela UI, como exemplos de códigos de
 * reserva do ambiente mock.
 */
export const getCheckInSupportContent = (): CheckInSupportContent => ({
  // A UI recebe apenas o conteúdo necessário, sem depender da infraestrutura mock.
  reservationCodeExamples: [...mockReservationCodeExamples],
});

/**
 * Composição principal da jornada de check-in.
 * Centraliza a criação das dependências para manter a UI desacoplada da
 * infraestrutura concreta e facilitar a troca do mock por integrações reais.
 */
export const createCheckInExperience = () => {
  // Este é o ponto único de composição para facilitar a troca do mock por API real.
  const repository = new MockCheckInRepository();

  return {
    findReservation: new FindReservationUseCase(repository),
    confirmCheckIn: new ConfirmCheckInUseCase(repository),
    issueGuestAccess: new IssueGuestAccessUseCase(repository),
  };
};
