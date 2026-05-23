// Configuração simples por ambiente, lida em runtime no servidor.
// Mantém suporte mínimo a multi-tenant e multi-totem sem painel administrativo.
export interface RuntimeConfig {
  hotelId: string;
  kioskId: string;
}

const DEFAULTS: RuntimeConfig = {
  hotelId: "default-hotel",
  kioskId: "kiosk-lobby-01",
};

export const getRuntimeConfig = (): RuntimeConfig => ({
  hotelId: process.env.CHECKFLEX_HOTEL_ID ?? DEFAULTS.hotelId,
  kioskId: process.env.CHECKFLEX_KIOSK_ID ?? DEFAULTS.kioskId,
});
