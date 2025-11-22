// src/db/index.js
import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import pkg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pkg;

let db;

if (process.env.NODE_ENV === "test") {
  // TEST MODE: Use PostgreSQL with node-postgres
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  db = drizzlePg(pool, { schema });
  console.log("🧪 Using TEST database (PostgreSQL)");
} else {
  // PRODUCTION MODE: Use Neon serverless
  const client = neon(process.env.DATABASE_URL);
  db = drizzle(client, { schema });
  console.log("☁️ Using PRODUCTION database (Neon)");
}

export { db };
