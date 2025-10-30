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
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;