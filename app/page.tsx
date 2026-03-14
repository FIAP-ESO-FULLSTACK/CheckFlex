import { CheckInExperience } from "@/presentation/components/check-in-experience";

/**
 * Página inicial do totem.
 * Mantém a rota principal enxuta e delega a jornada completa de check-in
 * para o componente de apresentação responsável pela experiência do hóspede.
 */
export default function HomePage() {
  return <CheckInExperience />;
}
