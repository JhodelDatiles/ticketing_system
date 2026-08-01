import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email FROM users WHERE role = 'admin'`,
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;

    const [result] = await pool.query(
      `UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ? AND role = 'admin'`,
      [first_name, last_name, email, id],
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json({ id, first_name, last_name, email });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ error: "Failed to update admin" });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `DELETE FROM users WHERE id = ? AND role = 'admin'`,
      [id],
    );
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ error: "Failed to delete admin" });
  }
};
