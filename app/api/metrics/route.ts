import { NextResponse } from "next/server";
import { getServerEventLogger } from "@/infrastructure/server/check-in-services";

// Endpoint somente leitura usado pela tela /metricas e por scripts simples
// que queiram consultar contadores agregados.
export const GET = async () => {
  const summary = await getServerEventLogger().summarize();
  return NextResponse.json(summary);
};
