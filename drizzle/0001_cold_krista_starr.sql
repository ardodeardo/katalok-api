CREATE TYPE "public"."role" AS ENUM('superadmin', 'user');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "private_catalog" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");