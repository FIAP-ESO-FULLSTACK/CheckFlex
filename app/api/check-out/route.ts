import { NextResponse } from "next/server";
import { z } from "zod";
import { CheckoutUseCase } from "@/application/use-cases/checkout-use-case";
import {
  getServerCheckInRepository,
  getServerEventLogger,
} from "@/infrastructure/server/check-in-services";

const checkoutSchema = z.object({
  code: z.string().min(1),
  document: z.string().optional(),
  birthDate: z.string().optional(),
});

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    const useCase = new CheckoutUseCase(getServerCheckInRepository());
    const result = await useCase.execute(parsed.data);
    const eventLogger = getServerEventLogger();
    await eventLogger.record({
      type: "check-out.completed",
      metadata: { reservationId: result.reservation.id },
    });
    if (result.revokedAccessCount > 0) {
      await eventLogger.record({
        type: "access.revoked",
        metadata: {
          reason: "checkout",
          reservationId: result.reservation.id,
          count: result.revokedAccessCount,
        },
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao concluir check-out.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
};
