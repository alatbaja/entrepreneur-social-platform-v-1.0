import { SQLDatabase } from "encore.dev/storage/sqldb";

export const contentDB = new SQLDatabase("content", {
  migrations: "./migrations",
});
