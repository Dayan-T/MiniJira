import{ Router } from "express";
const router = Router();
import { pool } from "../db/db"; 
import { requireAuth } from "../middleware/authMiddleware.js";

router.get("/",requireAuth, async (req:any, res:any) => {
  try {
    const result = await pool.query("SELECT * FROM issues WHERe project_id IN (SELECT project_id FROM project_members WHERE user_id = $1)", [(req as any).user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});
router.post("/",requireAuth, async (req:any, res:any) => {
  const { title,  project_id, status = 'TODO', priority="MEDIUM", description, assignee_id} = req.body;
  const isMember= await pool.query("SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2", [project_id, req.user.id]);
  if (!isMember.rows[0]) {
    return res.status(403).json({ error: "Forbidden: You must be a project member to create an issue" });
  }
  try {
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

router.delete("/:project_id/:issue_id",requireAuth, async (req:any, res:any) => {
  const { project_id, issue_id } = req.params;
  const isMember= await pool.query("SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2", [project_id, req.user.id]);
  if (!isMember.rows[0]) {
    return res.status(403).json({ error: "Forbidden: You must be a project member to delete an issue" });
  }
  try {
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

router.put("/:project_id/:issue_id", requireAuth,async (req:any, res:any) => {
  const { title, status, priority,description,assignee_id }= req.body;
  const { project_id, issue_id } = req.params;
  const isMember= await pool.query("SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2", [project_id, req.user.id]);
  if (!isMember.rows[0]) {
      return res.status(403).json({ error: "Forbidden: You must be a project member to update an issue" });
    }
  try {
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

