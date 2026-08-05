import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

export const reorderTickets = async (req: Request, res: Response) => {
  try {
    const { status_id, ticket_ids } = req.body;

    if (!status_id || !Array.isArray(ticket_ids) || ticket_ids.length === 0) {
      return res
        .status(400)
        .json({ error: "status_id and ticket_ids are required" });
    }

    const [statusRows] = await pool.query(`SELECT id FROM statuses WHERE id = ?`, [status_id]);
    if ((statusRows as unknown[]).length === 0) {
      return res.status(400).json({ error: "Invalid status_id" });
    }

    const [existingRows] = await pool.query(
      `SELECT id FROM tickets WHERE id IN (?) AND deleted_at IS NULL`,
      [ticket_ids],
    );
    const existingIds = new Set((existingRows as { id: number }[]).map((r) => r.id));
    const missing = ticket_ids.filter((id: number) => !existingIds.has(id));

    if (missing.length > 0) {
      return res.status(400).json({ error: `Unknown or deleted ticket ids: ${missing.join(", ")}` });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (let i = 0; i < ticket_ids.length; i++) {
        await connection.query(
          `UPDATE tickets SET status_id = ?, board_position = ?
           WHERE id = ? AND deleted_at IS NULL`,
          [status_id, i, ticket_ids[i]],
        );
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    res.status(200).json({ status_id, ticket_ids });
  } catch (error) {
    console.error("Error reordering tickets:", error);
    res.status(500).json({ error: "Failed to reorder tickets" });
  }
};