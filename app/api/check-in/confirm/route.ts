import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getServerCheckInRepository,
  getServerEventLogger,
} from "@/infrastructure/server/check-in-services";

const confirmSchema = z.object({
  reservationId: z.string().min(1),
});

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = confirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    const repository = getServerCheckInRepository();
    const reservation = await repository.confirmCheckIn(parsed.data.reservationId);
    await getServerEventLogger().record({
      type: "check-in.completed",
      metadata: { reservationId: reservation.id, code: reservation.code },
    });
    return NextResponse.json({ reservation });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao confirmar check-in.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
};
