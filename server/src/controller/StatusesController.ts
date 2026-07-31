import type { Request, Response } from "express";
import { pool } from "../config/railway.ts";

export const getStatuses = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM statuses ORDER BY id`);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({ error: "Failed to fetch statuses" });
  }
};

export const createStatus = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO statuses (name) VALUES (?)`,
      [name],
    );
    const insertId = (result as { insertId: number }).insertId;

    res.status(201).json({ id: insertId, name });
  } catch (error) {
    console.error("Error creating status:", error);
    res.status(500).json({ error: "Failed to create status" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const [result] = await pool.query(
      `UPDATE statuses SET name = ? WHERE id = ?`,
      [name, id],
    );
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Status not found" });
    }

    res.status(200).json({ id, name });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};

export const deleteStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM statuses WHERE id = ?`, [
      id,
    ]);
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Status not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting status:", error);
    res.status(500).json({ error: "Failed to delete status" });
  }
};
