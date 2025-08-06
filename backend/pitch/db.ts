import { SQLDatabase } from "encore.dev/storage/sqldb";

export const pitchDB = new SQLDatabase("pitch", {
  migrations: "./migrations",
});
