import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

const ALLOWED_FIELDS = [
  "title",
  "description",
  "category_id",
  "priority_id",
  "status_id",
] as const;

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Record<string, unknown> = {};

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setClause = Object.keys(updates)
      .map((field) => `${field} = ?`)
      .join(", ");
    const values = [...Object.values(updates), id];

    const [result] = await pool.query(
      `UPDATE tickets SET ${setClause} WHERE id = ?`,
      values,
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json({ id, ...updates });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Failed to update ticket" });
  }
};
