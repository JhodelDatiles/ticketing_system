import type { Request, Response } from "express";
import { pool } from "../config/railway.ts";

export const getPriorities = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM priorities ORDER BY id`);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching priorities:", error);
    res.status(500).json({ error: "Failed to fetch priorities" });
  }
};

export const createPriority = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO priorities (name) VALUES (?)`,
      [name],
    );
    const insertId = (result as { insertId: number }).insertId;

    res.status(201).json({ id: insertId, name });
  } catch (error) {
    console.error("Error creating priority:", error);
    res.status(500).json({ error: "Failed to create priority" });
  }
};

export const updatePriority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const [result] = await pool.query(
      `UPDATE priorities SET name = ? WHERE id = ?`,
      [name, id],
    );
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Priority not found" });
    }

    res.status(200).json({ id, name });
  } catch (error) {
    console.error("Error updating priority:", error);
    res.status(500).json({ error: "Failed to update priority" });
  }
};

export const deletePriority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM priorities WHERE id = ?`, [
      id,
    ]);
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Priority not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting priority:", error);
    res.status(500).json({ error: "Failed to delete priority" });
  }
};
