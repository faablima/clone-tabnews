const database = require("../database");

const MAX_ATTEMPTS = 30;
const RETRY_DELAY = 2000;

async function checkPostgres() {
  attempts++;

  if (attempts > MAX_ATTEMPTS) {
    console.error("\n❌ Timeout: Postgres não ficou pronto em 30 segundos");
    await database.close();
    process.exit(1);
  }

  try {
    await database.query("SELECT 1");

    console.log(
      `\n🟢 Postgres está pronto e aceitando conexões (${attempts}s)`,
    );
    await database.close();
    process.exit(0);
  } catch (error) {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    return checkPostgres();
  }
}

console.log("🔴 Aguardando o postgres aceitar conexões...");
checkPostgres();
