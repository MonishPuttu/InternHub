// Tests/setup/setup-test-db.js
import { execSync } from "child_process";

console.log("🔧 Setting up test database...");

try {
  // Push schema to test database
  execSync(
    'DATABASE_URL="postgresql://test_user:test_password@localhost:5433/internhub_test" npx drizzle-kit push',
    { stdio: "inherit" }
  );
  console.log("✅ Test database schema created");
} catch (err) {
  console.error("❌ Failed to create test database schema");
  process.exit(1);
}
