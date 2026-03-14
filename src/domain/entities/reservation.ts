/**
 * Estados relevantes da reserva dentro do fluxo atual de autoatendimento.
 */
export type ReservationStatus = "reserved" | "checked-in";

/**
 * Representa a hospedagem localizada pelo hóspede antes da emissão do acesso.
 * Esta entidade concentra apenas os dados necessários para revisar a estadia
 * e concluir o check-in no totem.
 */
export interface Reservation {
  id: string;
  code: string;
  propertyName: string;
  roomNumber: string;
  roomLabel: string;
  guestFullName: string;
  // Datas em ISO-8601 para manter transporte simples entre camadas.
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  status: ReservationStatus;
}
