import { SQLDatabase } from "encore.dev/storage/sqldb";

export const iamDB = new SQLDatabase("iam", {
  migrations: "./migrations",
});
