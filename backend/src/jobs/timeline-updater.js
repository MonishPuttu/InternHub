// src/jobs/timeline-updater.js
import cron from "node-cron";
import { db } from "../db/index.js";
import {
  student_applications,
  application_timeline,
  posts,
} from "../db/schema/index.js";
import { eq, and, lt, isNotNull } from "drizzle-orm";

// ✅ Run every hour
export function startTimelineUpdater() {
  cron.schedule("0 * * * *", async () => {
    console.log("🔄 Running timeline updater...");

    try {
      // ✅ Find applications where:
      // 1. Status is "applied"
      // 2. Interview date from post has passed
      // 3. Student hasn't confirmed attendance yet
      const applicationsToCheck = await db
        .select({
          application: student_applications,
          post: posts,
        })
        .from(student_applications)
        .leftJoin(posts, eq(student_applications.post_id, posts.id))
        .where(
          and(
            eq(student_applications.application_status, "applied"),
            isNotNull(posts.interview_date),
            lt(posts.interview_date, new Date()), // Interview date has passed
            eq(student_applications.interview_confirmed, false)
          )
        );

      for (const { application, post } of applicationsToCheck) {
        // Update application status to "interview_scheduled"
        await db
          .update(student_applications)
          .set({
            application_status: "interview_scheduled",
            interview_date: post.interview_date,
            updated_at: new Date(),
          })
          .where(eq(student_applications.id, application.id));

        // Add timeline event
        await db.insert(application_timeline).values({
          application_id: application.id,
          event_type: "interview_scheduled",
          title: "Interview Scheduled",
          description: `Interview scheduled on ${new Date(
            post.interview_date
          ).toLocaleString()}. Please confirm your attendance.`,
          event_date: new Date(),
          visibility: "student",
        });

        console.log(
          `✅ Updated application ${application.id} to interview_scheduled`
        );
      }

      console.log(`✅ Checked ${applicationsToCheck.length} applications`);
    } catch (error) {
      console.error("❌ Error in timeline updater:", error);
    }
  });

  console.log("🚀 Timeline updater cron job started");
}
