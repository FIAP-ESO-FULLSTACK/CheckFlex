import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEventLogger } from "@/infrastructure/server/check-in-services";

// Apenas eventos disparados pelo client são aceitos aqui. Mantém a lista
// curta para evitar uso indevido como log genérico do navegador.
const eventSchema = z.object({
  type: z.literal("language.changed"),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  }

  await getServerEventLogger().record(parsed.data);
  return NextResponse.json({ ok: true });
};
