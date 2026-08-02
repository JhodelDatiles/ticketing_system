import type { Request, Response } from "express";
import { pool } from "../config/railway.ts";

export const getCommentsByTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC`,
      [ticketId],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { user_id, message } = req.body;

    if (!user_id || !message) {
      return res
        .status(400)
        .json({ error: "user_id and message are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO comments (ticket_id, user_id, message) VALUES (?, ?, ?)`,
      [ticketId, user_id, message],
    );

    const insertId = (result as { insertId: number }).insertId;

    res
      .status(201)
      .json({ id: insertId, ticket_id: ticketId, user_id, message, created_at: new Date().toISOString() });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM comments WHERE id = ?`, [
      id,
    ]);
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
