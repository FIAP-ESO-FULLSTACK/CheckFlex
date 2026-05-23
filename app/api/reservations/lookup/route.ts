import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerCheckInRepository } from "@/infrastructure/server/check-in-services";

// Aceita o segundo fator de validação. Pelo menos um dos dois deve vir junto
// quando a reserva exigir validação de identidade.
const lookupSchema = z.object({
  code: z.string().min(1),
  document: z.string().optional(),
  birthDate: z.string().optional(),
});

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = lookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const repository = getServerCheckInRepository();
  const reservation = await repository.findReservation(parsed.data);

  if (!reservation) {
    return NextResponse.json({ reservation: null }, { status: 404 });
  }

  return NextResponse.json({ reservation });
};
