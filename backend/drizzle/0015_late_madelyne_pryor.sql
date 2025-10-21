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
	"created_at" timestamp DEFAULT now() NOT NULL
);
