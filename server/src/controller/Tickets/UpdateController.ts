import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

const STAFF_ALLOWED_FIELDS = [
  "title",
  "description",
  "category_id",
  "priority_id",
  "status_id",
] as const;

const CUSTOMER_ALLOWED_FIELDS = [
  "title",
  "description",
  "category_id",
  "priority_id",
] as const;

interface TicketRow {
  id: number;
  created_by: number;
  closed_at: string | null;
}

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user!;

    const [rows] = await pool.query(
      `SELECT id, created_by, closed_at FROM tickets WHERE id = ?`,
      [id],
    );
    const ticket = (rows as TicketRow[])[0];

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const isStaff = role === "admin" || role === "agent";
    const isOwner = ticket.created_by === userId;

    if (!isStaff && !isOwner) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    if (!isStaff && ticket.closed_at) {
      return res.status(403).json({ error: "Cannot edit a closed ticket" });
    }

    const allowedFields = isStaff ? STAFF_ALLOWED_FIELDS : CUSTOMER_ALLOWED_FIELDS;
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
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