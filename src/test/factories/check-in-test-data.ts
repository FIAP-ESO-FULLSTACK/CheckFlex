import { vi } from "vitest";
import { GuestAccess } from "@/domain/entities/guest-access";
import { Reservation } from "@/domain/entities/reservation";
import {
  CheckInRepository,
  CheckoutRepository,
} from "@/domain/repositories/check-in-repository";

export const makeReservation = (
  overrides: Partial<Reservation> = {},
): Reservation => ({
  id: "res-504",
  code: "CKF-5042",
  propertyName: "Fiap Suítes",
  roomNumber: "504",
  roomLabel: "Suíte Horizonte",
  guestFullName: "Marina Alves",
  checkInDate: "2026-03-14T14:00:00.000Z",
  checkOutDate: "2026-03-17T12:00:00.000Z",
  nights: 3,
  status: "reserved",
  ...overrides,
});

export const makeGuestAccess = (
  overrides: Partial<GuestAccess> = {},
): GuestAccess => ({
  pin: "320504",
  digitalKeyTarget: "+5511999999999",
  digitalKeyChannel: "phone",
  roomNumber: "504",
  roomLabel: "Suíte Horizonte",
  expiresAt: "2026-03-17T12:00:00.000Z",
  appProvider: "G-Locks",
  ...overrides,
});

export const makeCheckInRepositorySpy = () => ({
  findReservation: vi.fn<CheckInRepository["findReservation"]>(),
  confirmCheckIn: vi.fn<CheckInRepository["confirmCheckIn"]>(),
  issueGuestAccess: vi.fn<CheckInRepository["issueGuestAccess"]>(),
});

export const makeCheckoutRepositorySpy = () => ({
  findReservation: vi.fn<CheckoutRepository["findReservation"]>(),
  checkout: vi.fn<CheckoutRepository["checkout"]>(),
  revokeExpiredAccesses: vi.fn<CheckoutRepository["revokeExpiredAccesses"]>(),
});
