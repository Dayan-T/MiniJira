import{ Router } from "express";
const router = Router();
import { pool } from "../db/db"; 
import { requireAuth } from "../middleware/authMiddleware.js";

router.get("/", requireAuth, async (req:any, res:any) => {;
  try {
    const { issue_id } = req.query;
    if (!issue_id) {
      return res.status(400).json({ error: "issue_id is required" });
    }
    const issueResult = await pool.query(
      "SELECT project_id FROM issues WHERE issue_id = $1",
      [issue_id]
    );
    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const membership = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2",
      [issueResult.rows[0].project_id, req.user.id]
    );
    if (!membership.rows[0]) {
      return res.status(403).json({ error: "Forbidden: You must be a project member" });
    }

    const result = await pool.query(
      "SELECT * FROM comments WHERE issue_id = $1",
      [issue_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/",requireAuth, async (req:any, res:any) => {
  const { issue_id, content } = req.body;
  const projectId = await pool.query("SELECT project_id FROM issues WHERE issue_id = $1", [issue_id]);
  if (projectId.rows.length === 0) {
    return res.status(404).json({ error: "Issue not found" });
  }
  const projectmembership = await pool.query(
    "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2", 
    [projectId.rows[0].project_id, req.user.id]
  );
  if (!projectmembership.rows[0]) {
    return res.status(403).json({ error: "Forbidden: You must be a project member to comment" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO comments (issue_id, content, author_id) VALUES ($1, $2, $3) RETURNING *",
      [issue_id, content, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:issue_id/:comment_id",requireAuth, async (req:any, res:any) => {
  const { issue_id, comment_id } = req.params;
  try {
    const pmResult = await pool.query(
      "SELECT * FROM project_members WHERE project_id = (SELECT project_id FROM issues WHERE issue_id = $1) AND user_id = $2",
      [issue_id, req.user.id]
    );
    if (!pmResult.rows[0]) {
      return res.status(403).json({ error: "Forbidden: You must be a project member to delete a comment" });
    }
    const result = await pool.query(
      "DELETE FROM comments WHERE issue_id = $1 AND comment_id = $2 RETURNING *",
      [issue_id, comment_id]
    );
    if (result.rowCount === 0) {
    return res.status(404).json({ error: "comment not found" });
  } 
    return res.json({ message: "comment deleted successfully" });
}
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:issue_id/:comment_id",requireAuth,async (req:any, res:any) => {
  try {
    const { content } = req.body;
    const { issue_id, comment_id } = req.params;
    const issueResult = await pool.query(
        "SELECT project_id FROM issues i JOIN comments c ON i.issue_id = c.issue_id WHERE c.comment_id = $1",
        [comment_id]
      );
      if (issueResult.rows.length === 0) {
    return res.status(404).json({ error: "Comment not found" });
    }
    const projectmembership = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2", 
      [issueResult.rows[0].project_id, req.user.id]
    );
    if (!projectmembership.rows[0]) {
      return res.status(403).json({ error: "Forbidden: You must be a project member" });
    };
    const result = await pool.query(
      "UPDATE comments SET content = $1 WHERE issue_id = $2 AND comment_id = $3 RETURNING *",
      [content, issue_id, comment_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "comment not found" });
    }
    return res.json({ message: "comment updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;  