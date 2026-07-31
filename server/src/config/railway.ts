import mysql from "mysql2/promise";
import { config } from "../envConfig.ts";

export const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
