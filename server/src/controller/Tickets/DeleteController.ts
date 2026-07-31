import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM tickets WHERE id = ?`, [id]);

    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
};
