import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log("DB URL in db.ts =", process.env.DATABASE_URL);
console.log("Exports from db.ts =", { pool });
