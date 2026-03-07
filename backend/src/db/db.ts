import dotenv from "dotenv";

dotenv.config();

import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log("DB URL in db.ts =", process.env.DATABASE_URL);