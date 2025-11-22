import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { setupTestDatabase, closeDatabase } from "../helpers/db-helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables FIRST
dotenv.config({ path: join(__dirname, "../../.env.test") });

// Verify test environment
if (process.env.NODE_ENV !== "test") {
  console.warn('⚠️  NODE_ENV is not "test"');
}

// Global setup - runs once before ALL tests
beforeAll(async () => {
  console.log("🧪 Starting test suite...");
  try {
    await setupTestDatabase();
    console.log("✅ Test database initialized");
  } catch (error) {
    console.error("❌ Failed to setup test database:", error);
    process.exit(1);
  }
});

// Global teardown - runs once after ALL tests
afterAll(async () => {
  console.log("✅ Test suite completed");
  await closeDatabase();
});
