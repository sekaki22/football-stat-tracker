-- AlterTable
ALTER TABLE "Fines" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- Backfill existing rows
UPDATE "Fines" SET "active" = true WHERE "active" IS NULL;
