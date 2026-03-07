import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import projectsRouter from "./routes/projects.js";
import usersRouter from "./routes/users.js";
import issuesRouter from "./routes/issues.js";
import commentsRouter from "./routes/comments.js";
import projectMembersRouter from "./routes/project_members.js";
import authRouter from "./routes/auth.js";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("Mini Jira API running "));

app.use('/projects', projectsRouter);
app.use('/users', usersRouter);
app.use('/issues', issuesRouter);
app.use('/comments', commentsRouter);
app.use('/project_members', projectMembersRouter);
app.use('/auth', authRouter);

app.listen(3000, () => console.log("Server on 3000"));
