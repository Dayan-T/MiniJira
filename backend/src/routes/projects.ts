import{ Router } from "express";
const router = Router();
import { pool } from "../db/db.js"; 

router.get("/", async (_req:any, res:any) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", async (req:any, res:any) => {
  try {
    const { name, description, owner_id } = req.body;
    const result = await pool.query(
      "INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *",
      [name, description, owner_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:project_id", async (req:any, res:any) => {
  try {
    const { project_id } = req.params;
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING *",
      [project_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({message: "Project removed successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  } 
});

router.put("/:project_id", async (req:any, res:any) => {
  try {
    const { name, description } = req.body;
    const { project_id } = req.params;
    const result = await pool.query(
      "UPDATE projects SET name = $1, description = $2 WHERE project_id = $3 RETURNING *",
      [name, description, project_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    return res.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;  
