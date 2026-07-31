import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { pool } from "../../config/railway.ts";
import { generateToken } from "./JWTController.ts";

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [existing] = await pool.query(
      `SELECT id FROM users WHERE email = ?`,
      [email],
    );
    if ((existing as unknown[]).length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const finalRole = role ?? "customer";

    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, hashedPassword, finalRole],
    );

    const insertId = (result as { insertId: number }).insertId;
    const token = generateToken({ id: insertId, role: finalRole });

    res.status(201).json({
      id: insertId,
      first_name,
      last_name,
      email,
      role: finalRole,
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};
