import { Router } from "express";
const router = Router();
import { pool } from "../db/db"; 
import { requireAuth } from "../middleware/authMiddleware.js";

router.get("/projects/:project_id/members",requireAuth,async (req: any, res: any) => {
  try {
    const { project_id } = req.params;
    const userId = req.user.id;
    const ownerCheck = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'owner'",
      [project_id, userId]
    );
    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({
        error: "Forbidden: Only project owners can view members of this project",
      });
    }
    const result = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1",
      [project_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/project_members", requireAuth, async (req: any, res: any) => {
  try {
    const ownerId = req.user.id;  
    const { projectId, userId } = req.body;

    const project = await pool.query(
      "SELECT project_id FROM projects WHERE project_id = $1 AND owner_id = $2",
      [projectId, ownerId]
    );

    if (project.rows.length === 0) {
      return res.status(403).json({ error: "Not allowed to add members to this project" });
    }
    const result = await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING project_id, user_id, role`,
      [projectId, userId, "MEMBER"]  
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});


router.delete("/:project_id/:user_id",requireAuth, async (req:any, res:any) => {
  try { 
      const { project_id, user_id } = req.params;
      const userId = req.user.id;
      const ownerCheck = await pool.query(
        "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'OWNER'",
        [project_id, userId]
      );
      if (ownerCheck.rows.length === 0) {
        return res.status(403).json({
          error: "Forbidden: Only project owners can remove members from this project",
        });
      }
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

router.put("/:project_id/:user_id",requireAuth, async (req:any, res:any) => {
  try{
    const { role } = req.body;
    const{ project_id, user_id } = req.params;
    const userId = req.user.id;
    const ownerCheck = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'owner'",
      [project_id, userId]
    );
    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({
        error: "Forbidden: Only project owners can update members of this project",
      });
    }
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