import{ Router } from "express";
const router = Router();
import { pool } from "../db/db.js"; 
import { requireAuth } from "../middleware/authMiddleware.js";
import { ProjectMembersRepository } from "../repositories/ProjectMemberRepository.js";

router.get("/",requireAuth, async (_req:any, res:any) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/",requireAuth, async (req:any, res:any) => {
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

router.delete("/:project_id", requireAuth,async (req:any, res:any) => {
  const user = (req as any).user;
  const userID = user.id;
  const { project_id } = req.params;

  try {

    const membership= await ProjectMembersRepository.findByProjectAndUser(project_id, userID);
    if (!membership||membership.role!=="owner") {
      return res.status(403).json({ error: "Forbidden: Only project owners can delete the project" });

    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING *",
      [project_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({message: "Project removed successfully"});
  }} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  } 
});

router.put("/:project_id",requireAuth, async (req:any, res:any) => {
  const user = (req as any).user;
  const userID = user.id;
  const { project_id } = req.params;

  try {

    const membership= await ProjectMembersRepository.findByProjectAndUser(project_id, userID);
    if (!membership) {
      return res.status(403).json({ error: "Forbidden: Only project members can modify the project" });
    }
    const { name, description } = req.body;
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
