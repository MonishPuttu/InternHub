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
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE "placement_profile" ADD CONSTRAINT "placement_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiter_profile" ADD CONSTRAINT "recruiter_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;