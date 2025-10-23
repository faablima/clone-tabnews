import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

import database from "../../../../infra/database.js";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    response.setHeader("Allow", allowedMethods.join(", "));
    return response.status(405).json({
      error: "Method Not Allowed",
      allowed: allowedMethods,
    });
  }

  if (request.method === "GET") {
    const migrations = await migrationRunner({
      databaseUrl: database.getDatabaseUrl(),
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });
    return response.status(200).json(migrations);
  }

  if (request.method === "POST") {
    const migrations = await migrationRunner({
      databaseUrl: database.getDatabaseUrl(),
      dryRun: false,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });
    return response.status(200).json(migrations);
  }
}
