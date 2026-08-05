import { pool } from "../config/railway.ts";

export async function rowExists(table: string, id: unknown): Promise<boolean> {
  if (id === undefined || id === null) return false;
  const [rows] = await pool.query(
    `SELECT id FROM ${table} WHERE id = ? LIMIT 1`,
    [id],
  );
  return (rows as unknown[]).length > 0;
}
