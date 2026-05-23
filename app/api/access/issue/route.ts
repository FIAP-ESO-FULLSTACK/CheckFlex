import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getServerCheckInRepository,
  getServerEventLogger,
} from "@/infrastructure/server/check-in-services";

const issueSchema = z
  .object({
    reservationId: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().optional(),
  })
  .refine((value) => Boolean(value.phone || value.email), {
    message: "Informe telefone ou e-mail.",
  });

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = issueSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    const repository = getServerCheckInRepository();
    const access = await repository.issueGuestAccess(parsed.data);
    await getServerEventLogger().record({
      type: "access.issued",
      metadata: {
        reservationId: parsed.data.reservationId,
        channel: access.digitalKeyChannel,
      },
    });
    return NextResponse.json({ access });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao emitir credenciais.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
};
