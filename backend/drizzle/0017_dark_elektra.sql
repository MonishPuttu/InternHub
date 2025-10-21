CREATE TABLE "posts" (
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
	"approval_status" text DEFAULT 'pending',
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;