import database from "infra/database";

beforeAll(cleanDatabase);

afterAll(async () => {
  await database.close();
});

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("POST to /api/v1/migrations applies pending migrations", async () => {
  // 1. Verificar estado inicial: migrations pendentes via API
  const getPendingResponse = await fetch(
    "http://localhost:3000/api/v1/migrations",
  );
  const pendingMigrations = await getPendingResponse.json();

  expect(Array.isArray(pendingMigrations)).toBe(true);
  expect(pendingMigrations.length).toBeGreaterThan(0);

  // 2. Aplicar as migrations via POST
  const postResponse = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(postResponse.status).toBe(200);

  const appliedMigrations = await postResponse.json();

  expect(Array.isArray(appliedMigrations)).toBe(true);
  expect(appliedMigrations.length).toBe(pendingMigrations.length);

  // 3. Verificar que a tabela pgmigrations foi populada
  const migrationsInDatabase = await database.query(
    "SELECT * FROM pgmigrations;",
  );

  expect(migrationsInDatabase.rows.length).toBe(appliedMigrations.length);

  // 4. Verificar que não há mais migrations pendentes
  const getAfterResponse = await fetch(
    "http://localhost:3000/api/v1/migrations",
  );
  const afterPending = await getAfterResponse.json();

  expect(afterPending.length).toBe(0);

  // 5. Testar idempotência: POST novamente não deve aplicar nada
  const postAgainResponse = await fetch(
    "http://localhost:3000/api/v1/migrations",
    {
      method: "POST",
    },
  );
  const appliedAgain = await postAgainResponse.json();

  expect(appliedAgain.length).toBe(0);

  // 6. Confirmar que pgmigrations não mudou (idempotência)
  const finalMigrations = await database.query(
    "SELECT * FROM pgmigrations;",
  );

  expect(finalMigrations.rows.length).toBe(migrationsInDatabase.rows.length);
});
