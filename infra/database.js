import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  max: process.env.PG_MAX_CLIENTS ? Number(process.env.PG_MAX_CLIENTS) : 10,
  application_name: process.env.APP_NAME || "clone-tabnews",
});

export default {
  query: async (text, params) => {
    console.log("DB QUERY:", text);
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      console.log("DB QUERY OK:", Date.now() - start, "ms");
      return res;
    } catch (err) {
      console.error("DB QUERY ERROR:", err.message || err);
      throw err;
    }
  },
  close: async () => {
    await pool.end();
  },
};
