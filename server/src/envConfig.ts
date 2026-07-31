import dotenv from "dotenv";

dotenv.config();

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: Number(getEnvVar("PORT", "5000")),
  db: {
    host: getEnvVar("DB_HOST"),
    port: Number(getEnvVar("DB_PORT", "3306")),
    user: getEnvVar("DB_USER"),
    password: getEnvVar("DB_PASSWORD", ""),
    database: getEnvVar("DB_NAME"),
  },
};


console.log(`-----------------------------------`)
console.log(`port: config.port`);
console.log(config.db);
console.log(`-----------------------------------`)

