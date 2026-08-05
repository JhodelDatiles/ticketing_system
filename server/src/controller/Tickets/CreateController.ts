import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";
import { rowExists } from "../../utils/dbValidation.ts";

const DEFAULT_STATUS_ID = 1; // "Open"

function generateTicketNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${datePart}-${randomPart}`;
}

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { title, description, category_id, priority_id, assigned_to } =
      req.body;

    if (!title || !description || !category_id || !priority_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!(await rowExists("categories", category_id))) {
      return res.status(400).json({ error: "Invalid category_id" });
    }

    if (!(await rowExists("priorities", priority_id))) {
      return res.status(400).json({ error: "Invalid priority_id" });
    }

    if (assigned_to !== undefined && assigned_to !== null) {
      const [agentRows] = await pool.query(
        `SELECT id FROM users WHERE id = ? AND role = 'agent'`,
        [assigned_to],
      );
      if ((agentRows as unknown[]).length === 0) {
        return res
          .status(400)
          .json({ error: "assigned_to must be a valid agent" });
      }
    }

    const created_by = req.user!.id;
    const ticket_number = generateTicketNumber();

    const [result] = await pool.query(
      `INSERT INTO tickets
        (ticket_number, title, description, category_id, priority_id, status_id, created_by, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket_number,
        title,
        description,
        category_id,
        priority_id,
        DEFAULT_STATUS_ID,
        created_by,
        assigned_to ?? null,
      ],
    );

    const insertId = (result as { insertId: number }).insertId;

    res.status(201).json({
      id: insertId,
      ticket_number,
      title,
      description,
      category_id,
      priority_id,
      status_id: DEFAULT_STATUS_ID,
      created_by,
      assigned_to: assigned_to ?? null,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};
