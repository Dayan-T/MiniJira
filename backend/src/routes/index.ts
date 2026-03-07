import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Mini Jira API running ✅");
});

//IMPORT Routes
import projectsRouter from "./projects.js";
import usersRouter from "./users.js";
import issuesRouter from "./issues.js";
import commentsRouter from "./comments.js";
import projectMembersRouter from "./project_members.js";

app.use(projectsRouter);
app.use(usersRouter);
app.use(issuesRouter);     
app.use(commentsRouter);  
app.use(projectMembersRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
