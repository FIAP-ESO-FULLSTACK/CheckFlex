/**
 * Credencial temporária emitida ao fim do check-in para permitir o acesso
 * do hóspede ao quarto reservado durante a estadia.
 */
export interface GuestAccess {
  pin: string;
  // Destino que recebe a chave digital, como telefone ou e-mail.
  digitalKeyTarget: string;
  digitalKeyChannel: "phone" | "email";
  // E-mail informado no check-in, persistido independentemente do canal
  // principal da chave (usado para enviar confirmações no check-out).
  notificationEmail?: string | null;
  roomNumber: string;
  roomLabel: string;
  // Data de expiração em ISO-8601 para revogação alinhada ao checkout.
  expiresAt: string;
  appProvider: string;
}
