-- Track who created each event for delete authorization.
ALTER TABLE "events" ADD COLUMN "created_by_user_id" UUID;

ALTER TABLE "events"
  ADD CONSTRAINT "events_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "idx_events_created_by_user" ON "events"("created_by_user_id");
