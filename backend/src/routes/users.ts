import{ Router } from "express";
import jwt from "jsonwebtoken";
const router = Router();
import { pool } from "../db/db";  
import { requireAuth } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";


router.get("/me",requireAuth, async (req:any, res:any) => {
//console.log("REQ.USER /me =", req.user);

  try {
    const userId= req.user.id;
    const result = await pool.query("SELECT * FROM users Where user_id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/signup", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const existing = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email",
      [email, password_hash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT user_id, email, password_hash FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/me", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { email ,username } = req.body;

    const result = await pool.query(
      "UPDATE users SET email = $1, username = $2 WHERE user_id = $3 RETURNING user_id, email, username",
      [email, username, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/me/password", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE user_id = $2",
      [newHash, userId]
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;  
