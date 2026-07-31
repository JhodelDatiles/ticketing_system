import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

export const getAgents = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, created_at FROM users WHERE role = 'agent'`,
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
};

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;

    const [result] = await pool.query(
      `UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ? AND role = 'agent'`,
      [first_name, last_name, email, id],
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.status(200).json({ id, first_name, last_name, email });
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ error: "Failed to update agent" });
  }
};

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `DELETE FROM users WHERE id = ? AND role = 'agent'`,
      [id],
    );
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ error: "Failed to delete agent" });
  }
};
