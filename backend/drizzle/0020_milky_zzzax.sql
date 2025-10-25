ALTER TABLE "calevents" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "calevents" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "calevents" ALTER COLUMN "event_date" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "calevents" ALTER COLUMN "event_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "calevents" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "company_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "position" text NOT NULL;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "industry" text;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "registration_deadline" text;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "location_mode" text;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "package_offered" text;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "eligible_departments" text;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "organizer_contact" text;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "additional_notes" text;--> statement-breakpoint
ALTER TABLE "calevents" ADD COLUMN "updated_at" timestamp DEFAULT now();