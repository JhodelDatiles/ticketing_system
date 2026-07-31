import type { Request, Response } from "express";
import { pool } from "../config/railway.ts";

// Ticket counts grouped by status
export const getTicketsByStatus = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.name AS status, COUNT(t.id) AS count
       FROM statuses s
       LEFT JOIN tickets t ON t.status_id = s.id
       GROUP BY s.id, s.name`,
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error generating status report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

// Ticket counts grouped by priority
export const getTicketsByPriority = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.name AS priority, COUNT(t.id) AS count
       FROM priorities p
       LEFT JOIN tickets t ON t.priority_id = p.id
       GROUP BY p.id, p.name`,
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error generating priority report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

// Open ticket counts per agent
export const getAgentWorkload = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, COUNT(t.id) AS open_tickets
       FROM users u
       LEFT JOIN tickets t ON t.assigned_to = u.id AND t.closed_at IS NULL
       WHERE u.role = 'agent'
       GROUP BY u.id, u.first_name, u.last_name`,
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error generating agent workload report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

// Average resolution time in hours
export const getAverageResolutionTime = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) AS avg_hours
       FROM tickets
       WHERE closed_at IS NOT NULL`,
    );
    res.status(200).json((rows as unknown[])[0]);
  } catch (error) {
    console.error("Error generating resolution time report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};
