import{ Router } from "express";
const router = Router();
import { pool } from "../db/db.js"; 

router.get("/", async (_req:any, res:any) => {
  try {
    const result = await pool.query("SELECT * FROM issues");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});
router.post("/", async (req:any, res:any) => {
  try {
    const { title,  project_id, status = 'TODO', priority="MEDIUM", description, assignee_id} = req.body;
    const result = await pool.query(
      "INSERT INTO issues (title, project_id, status, priority, description, assignee_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, project_id, status, priority, description, assignee_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:project_id/:issue_id", async (req:any, res:any) => {
  try {
    const { project_id, issue_id } = req.params;
    const result = await pool.query(
      "DELETE FROM issues WHERE project_id = $1 AND id = $2 RETURNING *",
      [project_id, issue_id]
    );
    if (result.rowCount === 0) {
    return res.status(404).json({ error: "issue not found" });
  } 
    return res.json({ message: "issue deleted successfully" });
}
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:project_id/:issue_id",async (req:any, res:any) => {
  try {
    const { title, status, priority,description,assignee_id }= req.body;
    const { project_id, issue_id } = req.params;
    const result = await pool.query(
      "UPDATE issues SET title = $1, status = $2, priority = $3, description = $4, assignee_id = $5 WHERE project_id = $6 AND id = $7 RETURNING *",
      [title, status, priority, description, assignee_id, project_id, issue_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "issue not found" });
    }
    return res.json({ message: "issue updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;  

