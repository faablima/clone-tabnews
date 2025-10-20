const { loadEnvConfig } = require("@next/env");

const dotenvResult = require("dotenv");

dotenvResult.config({ path: ".env.development" });

loadEnvConfig(process.cwd());
