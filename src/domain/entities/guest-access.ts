export interface GuestAccess {
  pin: string;
  digitalKeyTarget: string;
  digitalKeyChannel: "phone" | "email";
  roomNumber: string;
  roomLabel: string;
  expiresAt: string;
  appProvider: string;
}
