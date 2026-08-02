import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

interface AgentRow {
  id: number;
  role: string;
}

export const assignTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return res.status(400).json({ error: "assigned_to is required" });
    }

    const [agentRows] = await pool.query(
      `SELECT id, role FROM users WHERE id = ?`,
      [assigned_to],
    );
    const agent = (agentRows as AgentRow[])[0];

    if (!agent || agent.role !== "agent") {
      return res.status(400).json({ error: "assigned_to must be a valid agent" });
    }

    const [result] = await pool.query(
      `UPDATE tickets SET assigned_to = ? WHERE id = ?`,
      [assigned_to, id],
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json({ id, assigned_to });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    res.status(500).json({ error: "Failed to assign ticket" });
  }
};