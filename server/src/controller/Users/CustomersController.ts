import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, created_at FROM users WHERE role = 'customer'`,
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;

    const [result] = await pool.query(
      `UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ? AND role = 'customer'`,
      [first_name, last_name, email, id],
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json({ id, first_name, last_name, email });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `DELETE FROM users WHERE id = ? AND role = 'customer'`,
      [id],
    );
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
};
