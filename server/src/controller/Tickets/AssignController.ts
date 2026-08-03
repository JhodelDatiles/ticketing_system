import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

interface AgentRow {
  id: number;
  role: string;
}

interface TicketRow {
  id: number;
  assigned_to: number | null;
}

export const assignTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;
    const userId = req.user!.id;

    if (!assigned_to) {
      return res.status(400).json({ error: "assigned_to is required" });
    }

    // 1. Validate assigned user is a valid agent
    const [agentRows] = await pool.query(
      `SELECT id, role FROM users WHERE id = ?`,
      [assigned_to],
    );
    const agent = (agentRows as AgentRow[])[0];
    if (!agent || agent.role !== "agent") {
      return res
        .status(400)
        .json({ error: "assigned_to must be a valid agent" });
    }

    // 2. Fetch current ticket assignment state
    const [ticketRows] = await pool.query(
      `SELECT id, assigned_to FROM tickets WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    const ticket = (ticketRows as TicketRow[])[0];
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // 3. Update assignment
    const [result] = await pool.query(
      `UPDATE tickets SET assigned_to = ? WHERE id = ?`,
      [assigned_to, id],
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // 4. Log history if assignment changed
    if (ticket.assigned_to !== assigned_to) {
      await pool.query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value) VALUES (?, ?, 'assigned_to', ?, ?)`,
        [
          id,
          userId,
          ticket.assigned_to === null ? null : String(ticket.assigned_to),
          String(assigned_to),
        ],
      );
    }

    res.status(200).json({ id, assigned_to });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    res.status(500).json({ error: "Failed to assign ticket" });
  }
};
