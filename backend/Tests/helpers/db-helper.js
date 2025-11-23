// Tests/helpers/db-helper.js
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { sql } from "drizzle-orm";

const { Pool } = pkg;

import {
  user,
  student_profile,
  placement_profile,
  recruiter_profile,
  session,
} from "../../src/db/schema/user.js";

import { rooms, room_members, messages } from "../../src/db/schema/chat.js";

import {
  education,
  projects,
  social_links,
} from "../../src/db/schema/profile.js";

import { calevents } from "../../src/db/schema/calendar.js";

import { posts } from "../../src/db/schema/post.js";

import { student_applications } from "../../src/db/schema/Dashboard/student_applications.js";
import { sent_lists } from "../../src/db/schema/Dashboard/sent_lists.js";

import { application_timeline } from "../../src/db/schema/timeline.js";

import { offer_letters } from "../../src/db/schema/offers.js";

import {
  assessments,
  questions,
  student_attempts,
  student_answers,
} from "../../src/db/schema/training.js";

const tableList = [
  offer_letters,
  application_timeline,
  sent_lists,
  student_applications,
  posts,
  calevents,
  messages,
  room_members,
  rooms,
  education,
  projects,
  social_links,
  student_answers,
  student_attempts,
  questions,
  assessments,
  session,
  recruiter_profile,
  placement_profile,
  student_profile,
  user,
];

let pool;
export let db;

export async function setupTestDatabase() {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  db = drizzle(pool);
}

export async function cleanDatabase() {
  if (!db) throw new Error("Database not initialized");

  try {
    await db.execute(sql`SET session_replication_role = 'replica'`);

    for (const table of tableList) {
      const tableName =
        table[Symbol.for("drizzle:Name")] ||
        table[Symbol.for("drizzle:OriginalName")];

      if (!tableName) {
        continue;
      }

      try {
        await db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" CASCADE`));
      } catch (err) {
        if (err.code === "42P01") {
          console.error(`❌ Table "${tableName}" doesn't exist!`);
          console.error(`Run: npm run db:push:test`);
          throw new Error(`Missing table: ${tableName}`);
        }
        throw err;
      }
    }

    await db.execute(sql`SET session_replication_role = 'origin'`);
  } catch (err) {
    throw err;
  }
}

export async function closeDatabase() {
  await pool?.end();
}

export function getDb() {
  return db;
}
