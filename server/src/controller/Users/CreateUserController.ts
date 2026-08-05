import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";

const SALT_ROUNDS = 10;
const VALID_ROLES = ["admin", "agent", "customer"] as const;

export const createUser = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const [existing] = await pool.query(
      `SELECT id FROM users WHERE email = ?`,
      [email],
    );
    if ((existing as unknown[]).length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, hashedPassword, role],
    );

    const insertId = (result as { insertId: number }).insertId;

    res.status(201).json({ id: insertId, first_name, last_name, email, role });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};
