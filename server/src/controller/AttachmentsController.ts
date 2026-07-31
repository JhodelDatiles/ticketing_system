import type { Request, Response } from "express";
import { pool } from "../config/railway.ts";

export const getAttachmentsByTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM attachments WHERE ticket_id = ? ORDER BY uploaded_at DESC`,
      [ticketId],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
};

export const createAttachment = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { file_name, file_path, file_size, uploaded_by } = req.body;

    if (!file_name || !file_path || !file_size || !uploaded_by) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await pool.query(
      `INSERT INTO attachments (ticket_id, file_name, file_path, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?)`,
      [ticketId, file_name, file_path, file_size, uploaded_by],
    );

    const insertId = (result as { insertId: number }).insertId;

    res.status(201).json({
      id: insertId,
      ticket_id: ticketId,
      file_name,
      file_path,
      file_size,
      uploaded_by,
    });
  } catch (error) {
    console.error("Error creating attachment:", error);
    res.status(500).json({ error: "Failed to create attachment" });
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM attachments WHERE id = ?`, [
      id,
    ]);
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
};
