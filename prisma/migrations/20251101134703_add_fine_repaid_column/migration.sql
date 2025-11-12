-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fines" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fine_type_id" INTEGER NOT NULL,
    "fine_amount" INTEGER NOT NULL DEFAULT 0,
    "fine_amount_repaid" INTEGER NOT NULL DEFAULT 0,
    "player_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Fines_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fines_fine_type_id_fkey" FOREIGN KEY ("fine_type_id") REFERENCES "FineInformation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Fines" ("createdAt", "fine_amount", "fine_type_id", "id", "player_id", "updatedAt") SELECT "createdAt", "fine_amount", "fine_type_id", "id", "player_id", "updatedAt" FROM "Fines";
DROP TABLE "Fines";
ALTER TABLE "new_Fines" RENAME TO "Fines";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

UPDATE "Fines" SET "fine_amount_repaid" = 0 WHERE "fine_amount_repaid" IS NULL;