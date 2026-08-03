import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

export const getTicketHistory = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const [rows] = await pool.query(
      `SELECT h.*, u.first_name, u.last_name
       FROM ticket_history h
       JOIN users u ON u.id = h.user_id
       WHERE h.ticket_id = ?
       ORDER BY h.created_at DESC`,
      [ticketId],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching ticket history:", error);
    res.status(500).json({ error: "Failed to fetch ticket history" });
  }
};
