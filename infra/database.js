import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  ssl: getSSLValues(),
  max: process.env.PG_MAX_CLIENTS ? Number(process.env.PG_MAX_CLIENTS) : 10,
  application_name: process.env.APP_NAME || "clone-tabnews",
});

export default {
  query: async (text, params) => {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.error("DB QUERY ERROR:", err.message || err);
      throw err;
    }
  },
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);

    client.query = async (text, params) => {
      try {
        const res = await query(text, params);
        return res;
      } catch (err) {
        console.error("DB QUERY ERROR:", err.message || err);
        throw err;
      }
    };

    return {
      query: client.query,
      release,
    };
  },
  close: async () => {
    await pool.end();
  },
  getDatabaseUrl: () => {
    const {
      POSTGRES_USER,
      POSTGRES_PASSWORD,
      POSTGRES_HOST,
      POSTGRES_PORT,
      POSTGRES_DB,
    } = process.env;
    const port = POSTGRES_PORT || "5432";
    return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${port}/${POSTGRES_DB}`;
  },
};

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
      rejectUnauthorized: true,
    };
  }
  return process.env.NODE_ENV === "production" ? true : false;
}
