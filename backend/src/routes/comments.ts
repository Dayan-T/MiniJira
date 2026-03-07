import{ Router } from "express";
const router = Router();
import { pool } from "../db/db.js"; 

router.get("/", async (req:any, res:any) => {
  try {
    const result = await pool.query(
      "SELECT * FROM comments",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});
router.post("/", async (req:any, res:any) => {
  try {
    const { issue_id, content, author_id } = req.body;
    const result = await pool.query(
      "INSERT INTO comments (issue_id, content, author_id) VALUES ($1, $2, $3) RETURNING *",
      [issue_id, content, author_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:issue_id/:comment_id", async (req:any, res:any) => {
  try {
    const { issue_id, comment_id } = req.params;
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

router.put("/:issue_id/:comment_id",async (req:any, res:any) => {
  try {
    const { content } = req.body;
    const { issue_id, comment_id } = req.params;
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