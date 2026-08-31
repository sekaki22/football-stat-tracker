-- CreateTable
CREATE TABLE "SeasonPlayer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeasonPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CorveeTeams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season" TEXT NOT NULL,
    "team_letter" TEXT NOT NULL,
    "player_nickname" TEXT NOT NULL,
    "playerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CorveeTeams_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CorveeTeams" ("createdAt", "id", "player_nickname", "season", "team_letter", "updatedAt") SELECT "createdAt", "id", "player_nickname", "season", "team_letter", "updatedAt" FROM "CorveeTeams";
DROP TABLE "CorveeTeams";
ALTER TABLE "new_CorveeTeams" RENAME TO "CorveeTeams";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SeasonPlayer_season_idx" ON "SeasonPlayer"("season");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonPlayer_playerId_season_key" ON "SeasonPlayer"("playerId", "season");

-- Backfill: players with existing season stats
INSERT OR IGNORE INTO "SeasonPlayer" ("playerId", "season", "createdAt")
SELECT DISTINCT "playerId", "season", CURRENT_TIMESTAMP
FROM "SeasonStats";

-- Backfill: all players for legacy seasons (preserves current UI behavior)
INSERT OR IGNORE INTO "SeasonPlayer" ("playerId", "season", "createdAt")
SELECT p."id", s."season", CURRENT_TIMESTAMP
FROM "Player" p
CROSS JOIN (
  SELECT '24/25' AS "season"
  UNION ALL
  SELECT '25/26' AS "season"
) s;
