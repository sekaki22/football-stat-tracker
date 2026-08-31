-- Add nickname to Player (skip if already added from partial migration)
ALTER TABLE "Player" ADD COLUMN "nickname" TEXT;

-- Default nickname to name for existing players
UPDATE "Player" SET "nickname" = "name" WHERE "nickname" IS NULL;

-- Link corvee rows where nickname matches an existing player name
UPDATE "CorveeTeams"
SET "playerId" = (
  SELECT "id" FROM "Player" WHERE "Player"."name" = "CorveeTeams"."player_nickname" LIMIT 1
)
WHERE "playerId" IS NULL;

-- Create Player records for corvee nicknames without a match
INSERT INTO "Player" ("name", "nickname", "goals", "assists", "season", "createdAt", "updatedAt")
SELECT
  ct."player_nickname",
  ct."player_nickname",
  0,
  0,
  MIN(ct."season"),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "CorveeTeams" ct
WHERE ct."playerId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "Player" p
    WHERE p."name" = ct."player_nickname" OR p."nickname" = ct."player_nickname"
  )
GROUP BY ct."player_nickname";

-- Link remaining corvee rows
UPDATE "CorveeTeams"
SET "playerId" = (
  SELECT "id" FROM "Player" WHERE "Player"."name" = "CorveeTeams"."player_nickname" LIMIT 1
)
WHERE "playerId" IS NULL;

-- Set nicknames from corvee data where linked
UPDATE "Player"
SET "nickname" = (
  SELECT ct."player_nickname" FROM "CorveeTeams" ct WHERE ct."playerId" = "Player"."id" LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM "CorveeTeams" ct WHERE ct."playerId" = "Player"."id"
);

-- Remove corvee rows that still have no player (should not happen)
DELETE FROM "CorveeTeams" WHERE "playerId" IS NULL;

-- Remove duplicate team assignments
DELETE FROM "CorveeTeams"
WHERE "id" NOT IN (
  SELECT MIN("id") FROM "CorveeTeams" GROUP BY "season", "team_letter", "playerId"
);

-- Redefine CorveeTeams: drop player_nickname, require playerId
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CorveeTeams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season" TEXT NOT NULL,
    "team_letter" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CorveeTeams_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CorveeTeams" ("id", "season", "team_letter", "playerId", "createdAt", "updatedAt")
SELECT "id", "season", "team_letter", "playerId", "createdAt", "updatedAt"
FROM "CorveeTeams";
DROP TABLE "CorveeTeams";
ALTER TABLE "new_CorveeTeams" RENAME TO "CorveeTeams";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

CREATE INDEX "CorveeTeams_season_team_letter_idx" ON "CorveeTeams"("season", "team_letter");
CREATE UNIQUE INDEX "CorveeTeams_season_team_letter_playerId_key" ON "CorveeTeams"("season", "team_letter", "playerId");
