CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"position" text NOT NULL,
	"industry" text NOT NULL,
	"application_date" timestamp NOT NULL,
	"interview_date" timestamp,
	"offer_date" timestamp,
	"rejection_date" timestamp,
	"status" text DEFAULT 'applied' NOT NULL,
	"package_offered" numeric(10, 2),
	"notes" text,
	"media" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interview_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"interviewer_name" text,
	"round_number" integer NOT NULL,
	"feedback" text,
	"rating" integer,
	"conducted_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skill_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skill_name" text NOT NULL,
	"category" text NOT NULL,
	"proficiency_level" integer NOT NULL,
	"assessed_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calevents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"event_date" date NOT NULL,
	"event_time" time NOT NULL,
	"end_time" time,
	"event_type" text DEFAULT 'oncampus' NOT NULL,
	"location" text,
	"eligible_students" text,
	"description" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" uuid,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_members" (
	"room_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"type" text DEFAULT 'private' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"application_status" text DEFAULT 'applied',
	"applied_at" timestamp DEFAULT now(),
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"roll_number" text,
	"branch" text,
	"current_semester" text,
	"cgpa" text,
	"tenth_score" text,
	"twelfth_score" text,
	"contact_number" text,
	"resume_link" text,
	"cover_letter" text,
	"placement_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "placement_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"employee_id" text,
	"date_of_birth" timestamp,
	"gender" text,
	"contact_number" text,
	"role_designation" text,
	"department_branch" text,
	"college_name" text,
	"profile_picture" text,
	"headquarters_location" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "placement_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "placement_profile_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "recruiter_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"profile_picture" text,
	"date_of_birth" timestamp,
	"gender" text,
	"company_name" text,
	"role_designation" text,
	"industry_sector" text,
	"headquarters_location" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "recruiter_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "student_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"roll_number" text,
	"student_id" text,
	"date_of_birth" timestamp,
	"gender" text,
	"contact_number" text,
	"permanent_address" text,
	"current_address" text,
	"college_name" text,
	"profile_picture" text,
	"website" text,
	"linkedin" text,
	"branch" text,
	"current_semester" text,
	"cgpa" text,
	"tenth_score" text,
	"twelfth_score" text,
	"courses_certifications" text,
	"emis" text,
	"skills" text,
	"extra_activities" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "student_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "student_profile_roll_number_unique" UNIQUE("roll_number"),
	CONSTRAINT "student_profile_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"reset_token" text,
	"reset_token_expires" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"degree" text NOT NULL,
	"institution" text NOT NULL,
	"field_of_study" text,
	"start_date" text NOT NULL,
	"end_date" text,
	"grade" text,
	"coursework" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"technologies" text,
	"project_url" text,
	"start_date" text,
	"end_date" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"portfolio_website" text,
	"linkedin_profile" text,
	"github_profile" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"position" text NOT NULL,
	"industry" text NOT NULL,
	"application_date" timestamp NOT NULL,
	"application_deadline" timestamp,
	"status" text DEFAULT 'applied' NOT NULL,
	"package_offered" numeric(10, 2),
	"notes" text,
	"media" text,
	"approval_status" text DEFAULT 'pending',
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"duration" integer NOT NULL,
	"total_marks" integer NOT NULL,
	"passing_marks" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"rank" integer,
	"total_score" integer NOT NULL,
	"percentage_score" integer NOT NULL,
	"time_taken" integer,
	"attempt_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_type" text NOT NULL,
	"options" jsonb,
	"correct_answer" jsonb,
	"marks" integer NOT NULL,
	"difficulty" text,
	"tags" jsonb,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"attempt_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"overall_score" integer NOT NULL,
	"percentage_score" integer NOT NULL,
	"grade" text,
	"strengths" jsonb,
	"weaknesses" jsonb,
	"recommendations" text,
	"detailed_analysis" jsonb,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" jsonb NOT NULL,
	"is_correct" boolean,
	"marks_awarded" integer DEFAULT 0,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"status" text NOT NULL,
	"total_score" integer DEFAULT 0,
	"percentage_score" integer DEFAULT 0,
	"time_taken" integer,
	"is_evaluated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "department_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department" text NOT NULL,
	"post_id" uuid,
	"total_applied" integer DEFAULT 0 NOT NULL,
	"total_not_applied" integer DEFAULT 0 NOT NULL,
	"application_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "department_strength" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department" text NOT NULL,
	"total_students" integer DEFAULT 0 NOT NULL,
	"year" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "department_strength_department_unique" UNIQUE("department")
);
--> statement-breakpoint
CREATE TABLE "placement_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_students" integer DEFAULT 0 NOT NULL,
	"total_placed" integer DEFAULT 0 NOT NULL,
	"total_companies" integer DEFAULT 0 NOT NULL,
	"highest_package" integer DEFAULT 0 NOT NULL,
	"average_package" integer DEFAULT 0 NOT NULL,
	"year" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_assessments" ADD CONSTRAINT "skill_assessments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_profile" ADD CONSTRAINT "placement_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiter_profile" ADD CONSTRAINT "recruiter_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education" ADD CONSTRAINT "education_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_attempt_id_student_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."student_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_attempt_id_student_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."student_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attempts" ADD CONSTRAINT "student_attempts_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attempts" ADD CONSTRAINT "student_attempts_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;