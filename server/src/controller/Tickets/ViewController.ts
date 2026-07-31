import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

// GET /tickets - list all tickets
export const getTickets = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tickets ORDER BY created_at DESC`,
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

// GET /tickets/:id - single ticket
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`SELECT * FROM tickets WHERE id = ?`, [id]);
    const tickets = rows as unknown[];

    if (tickets.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json(tickets[0]);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
};
