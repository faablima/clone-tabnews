const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config({ path: ".env.development" });
const MAX_ATTEMPTS = 30;
const RETRY_DELAY = 1000;
let attempts = 0;

async function checkPostgres() {
  attempts++;

  if (attempts > MAX_ATTEMPTS) {
    console.error("\n❌ Timeout: Postgres não ficou pronto em 30 segundos");
    process.exit(1);
  }

  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });

  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.end();

    console.log(
      `\n🟢 Postgres está pronto e aceitando conexões (${attempts}s)`,
    );

    process.exit(0);
  } catch (error) {
    await client.end().catch(() => {});
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    return checkPostgres();
  }
}

console.log("🔴 Aguardando o postgres aceitar conexões...");
checkPostgres();
