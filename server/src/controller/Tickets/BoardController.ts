import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

export const getTicketsForBoard = async (req: Request, res: Response) => {
  try {
    const { assigned_to } = req.query;

    const conditions = ["deleted_at IS NULL"];
    const params: unknown[] = [];

    if (assigned_to) {
      conditions.push("assigned_to = ?");
      params.push(assigned_to);
    }

    const [rows] = await pool.query(
      `SELECT id, ticket_number, title, category_id, priority_id, status_id,
              assigned_to, created_by, created_at
       FROM tickets
       WHERE ${conditions.join(" AND ")}
       ORDER BY board_position ASC, created_at DESC`,
      params,
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching board tickets:", error);
    res.status(500).json({ error: "Failed to fetch board tickets" });
  }
};
