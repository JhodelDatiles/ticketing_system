import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2"; // Or your specific DB driver types
import { pool } from "../../config/railway.ts";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// GET /tickets - list all tickets (paginated, excludes soft-deleted)
export const getTickets = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(req.query.limit) || DEFAULT_PAGE_SIZE));
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT * FROM tickets WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM tickets WHERE deleted_at IS NULL`,
    );
    
    // Safely cast and check if countRows exists before accessing index 0
    const counts = countRows as RowDataPacket[];
    const total = counts?.[0]?.total ?? 0;

    res.status(200).json({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

// GET /tickets/:id - single ticket (excludes soft-deleted)
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM tickets WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    
    // Cast to an array of objects
    const tickets = rows as RowDataPacket[];

    // Check if tickets array exists and has elements
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json(tickets[0]);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
};

