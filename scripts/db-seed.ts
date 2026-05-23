import { sql } from "drizzle-orm";
import { createDatabase } from "../src/infrastructure/db/client";
import { hotels, reservations } from "../src/infrastructure/db/schema";

// Constrói uma data ISO X dias após o início do dia de hoje. Garante que as
// reservas geradas pelo seed estejam sempre no futuro em relação ao instante
// em que o app roda, evitando que o sweeper automático revogue as credenciais
// antes do hóspede testar o check-out manual.
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const offsetDate = (days: number, hours = 14) => {
  const d = new Date(startOfToday);
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

const seed = () => {
  const db = createDatabase();

  db.run(sql`DELETE FROM event_logs`);
  db.run(sql`DELETE FROM guest_accesses`);
  db.run(sql`DELETE FROM reservations`);
  db.run(sql`DELETE FROM hotels`);

  db.insert(hotels)
    .values([
      { id: "default-hotel", name: "Fiap Suítes" },
      { id: "praia-mar-hotel", name: "Praia Mar Resort" },
    ])
    .run();

  db.insert(reservations)
    .values([
      {
        id: "res-504",
        hotelId: "default-hotel",
        code: "CKF-5042",
        propertyName: "Fiap Suítes",
        roomNumber: "504",
        roomLabel: "Suíte Horizonte",
        guestFullName: "Marina Alves",
        guestDocument: "12345678909",
        guestBirthDate: null,
        checkInDate: offsetDate(0, 14),
        checkOutDate: offsetDate(3, 12),
        nights: 3,
        status: "reserved",
      },
      {
        id: "res-212",
        hotelId: "default-hotel",
        code: "CKF-2128",
        propertyName: "Fiap Suítes",
        roomNumber: "212",
        roomLabel: "Quarto Jardim",
        guestFullName: "Rafael Costa",
        guestDocument: null,
        guestBirthDate: "1990-05-22",
        checkInDate: offsetDate(0, 14),
        checkOutDate: offsetDate(1, 12),
        nights: 1,
        status: "reserved",
      },
      {
        id: "res-808",
        hotelId: "praia-mar-hotel",
        code: "PMR-8081",
        propertyName: "Praia Mar Resort",
        roomNumber: "808",
        roomLabel: "Bangalô Sereia",
        guestFullName: "Larissa Mendes",
        guestDocument: "98765432100",
        guestBirthDate: null,
        checkInDate: offsetDate(6, 14),
        checkOutDate: offsetDate(9, 12),
        nights: 3,
        status: "reserved",
      },
    ])
    .run();

  console.log("Seed concluído. Banco em ./checkflex.db.");
};

seed();
