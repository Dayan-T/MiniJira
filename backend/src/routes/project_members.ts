import { Router } from "express";
const router = Router();
import { pool } from "../db/db.js"; 

router.get("/", async (_req:any, res:any) => {
  try {
    const result = await pool.query(
      `SELECT * FROM project_members`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", async (req:any, res:any) => {
  try {
    const { project_id, user_id, role } = req.body; 
    
    const result = await pool.query(
      `INSERT INTO project_members (project_id, user_id, role) 
       VALUES ($1, $2, $3) 
       RETURNING project_id, user_id, role`,
      [project_id, user_id, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:project_id/:user_id", async (req:any, res:any) => {
  try { 
      const { project_id, user_id } = req.params;
      const result = await pool.query(
        "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *",
        [project_id, user_id]
      );
    if (result.rowCount === 0) {
    return res.status(404).json({ error: "project member not found" });
  } 
    return res.json({ message: "project member deleted successfully" });
}
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:project_id/:user_id",async (req:any, res:any) => {
  try{
    const { role } = req.body;
    const{ project_id, user_id } = req.params;
    const result = await pool.query(
      "UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *",
      [role, project_id, user_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "project member not found" });
    }
    return res.json({ message: "project member updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;  