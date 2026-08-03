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
  title: string;
  description: string;
  category_id: number;
  priority_id: number;
  status_id: number;
  created_by: number;
  closed_at: string | null;
}

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user!;

    // 1. Fetch current ticket to compare changes and verify permissions
    const [rows] = await pool.query(
      `SELECT id, title, description, category_id, priority_id, status_id, created_by, closed_at 
       FROM tickets WHERE id = ? AND deleted_at IS NULL`,
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

    // 2. Filter allowed fields
    const allowedFields = isStaff
      ? STAFF_ALLOWED_FIELDS
      : CUSTOMER_ALLOWED_FIELDS;
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // 3. Build history entries by comparing old vs new values
    const historyEntries = Object.entries(updates)
      .filter(
        ([field, newValue]) =>
          String(ticket[field as keyof TicketRow] ?? "") !==
          String(newValue ?? ""),
      )
      .map(([field, newValue]) => [
        id,
        userId,
        field, // maps to 'action' column
        ticket[field as keyof TicketRow] === null
          ? null
          : String(ticket[field as keyof TicketRow]),
        newValue === null ? null : String(newValue),
      ]);

    // 4. Perform update query
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

    // 5. Record audit logs in ticket_history
    if (historyEntries.length > 0) {
      await pool.query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value) VALUES ?`,
        [historyEntries],
      );
    }

    res.status(200).json({ id, ...updates });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Failed to update ticket" });
  }
};
