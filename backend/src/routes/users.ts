import{ Router } from "express";
const router = Router();
import { pool } from "../db/db.js";  


router.get("/", async (req:any, res:any) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/s", async (req:any, res:any) => {
  try {
    const { email, password_hash } = req.body;
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, password_hash]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:user_id", async (req:any, res:any) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [ user_id]
    );
    if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  } 
    return res.json({ message: "User deleted successfully" });

}
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;  
