import database from "infra/database";

async function status(request, response) {
  const updateAt = new Date().toISOString();

  const databaseVersioResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersioResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int AS open_connections FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnctionsValue =
    databaseOpenedConnectionsResult.rows[0].open_connections;

  response.status(200).json({
    update_at: updateAt,
    dependecies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        open_connections: databaseOpenedConnctionsValue,
      },
    },
  });
}

export default status;
