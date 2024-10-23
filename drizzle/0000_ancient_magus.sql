CREATE TABLE IF NOT EXISTS "posts" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"created_at" date DEFAULT now(),
	"content" varchar(255),
	"author_id" varchar(255)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "author_id_idx" ON "posts" USING btree ("author_id");