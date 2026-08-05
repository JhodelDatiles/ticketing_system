import type { Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "../config/railway.ts";
import { UPLOAD_DIR } from "../middleware/upload.ts";

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
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploaded_by = req.user!.id;

    const [result] = await pool.query(
      `INSERT INTO attachments (ticket_id, file_name, file_path, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?)`,
      [ticketId, file.originalname, file.filename, file.size, uploaded_by],
    );

    const insertId = (result as { insertId: number }).insertId;

    res.status(201).json({
      id: insertId,
      ticket_id: ticketId,
      file_name: file.originalname,
      file_path: file.filename,
      file_size: file.size,
      uploaded_by,
      uploaded_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating attachment:", error);
    res.status(500).json({ error: "Failed to create attachment" });
  }
};

export const downloadAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT file_name, file_path FROM attachments WHERE id = ?`,
      [id],
    );
    const attachment = (rows as { file_name: string; file_path: string }[])[0];

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    // path.basename strips any directory components, so a corrupted or
    // tampered file_path value can't escape UPLOAD_DIR
    const filePath = path.join(UPLOAD_DIR, path.basename(attachment.file_path));

    res.download(filePath, attachment.file_name, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          res.status(404).json({ error: "File not found on disk" });
        }
      }
    });
  } catch (error) {
    console.error("Error downloading attachment:", error);
    res.status(500).json({ error: "Failed to download attachment" });
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT file_path FROM attachments WHERE id = ?`,
      [id],
    );
    const attachment = (rows as { file_path: string }[])[0];

    const [result] = await pool.query(`DELETE FROM attachments WHERE id = ?`, [
      id,
    ]);
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (attachment) {
      const filePath = path.join(
        UPLOAD_DIR,
        path.basename(attachment.file_path),
      );
      await fs.unlink(filePath).catch(() => {
        // file already gone from disk — not fatal, DB row is source of truth
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
};
