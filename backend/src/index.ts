import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/", (req, res) => {
  res.send("Mini Jira API running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});