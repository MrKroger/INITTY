ALTER TABLE "users" RENAME COLUMN "hobbies" TO "user_hobbies";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "failed_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lockout_until" timestamp;