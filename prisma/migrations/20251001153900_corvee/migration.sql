CREATE TABLE IF NOT EXISTS "CorveeTeams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season" TEXT NOT NULL,
    "team_letter" TEXT NOT NULL,
    "player_nickname" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "CorveeTeams" ("season", "team_letter", "player_nickname", "createdAt", "updatedAt") VALUES
('25/26', 'A', 'Tri', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'A', 'Meccie', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'A', 'Zoubie', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'A', 'Swiffer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'A', 'Scheidsie', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'B', 'Jizo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'B', 'Silla', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'B', 'Jaecksie', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'B', 'Michel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'C', 'Soutje', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'C', 'Ludje', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'C', 'Junior', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'C', 'Senior', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'D', 'Tygo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'D', 'Pay', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'D', 'Doekoe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'D', 'Doc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'E', 'Noah', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'E', 'Boa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'E', 'Boogs', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25/26', 'E', 'Ritzer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
;

CREATE TABLE IF NOT EXISTS "CorveePlanning" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season" TEXT NOT NULL,
    "team_letter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert corvee planning for 25/26
-- Team A corvee weeks
INSERT INTO "CorveePlanning" ("season", "team_letter", "year", "week") VALUES
('25/26', 'A', 2025, 36),
('25/26', 'A', 2025, 41),
('25/26', 'A', 2025, 46),
('25/26', 'A', 2025, 51),
('25/26', 'A', 2026, 4),
('25/26', 'A', 2026, 9),
('25/26', 'A', 2026, 14),
('25/26', 'A', 2026, 19)
;

-- Team B corvee weeks
INSERT INTO "CorveePlanning" ("season", "team_letter", "year", "week") VALUES
('25/26', 'B', 2025, 37),
('25/26', 'B', 2025, 42),
('25/26', 'B', 2025, 47),
('25/26', 'B', 2025, 52),
('25/26', 'B', 2026, 5),
('25/26', 'B', 2026, 10),
('25/26', 'B', 2026, 15),
('25/26', 'B', 2026, 20)
;

-- Team C corvee weeks
INSERT INTO "CorveePlanning" ("season", "team_letter", "year", "week") VALUES
('25/26', 'C', 2025, 38),
('25/26', 'C', 2025, 43),
('25/26', 'C', 2025, 48),
('25/26', 'C', 2026, 1),
('25/26', 'C', 2026, 6),
('25/26', 'C', 2026, 11),
('25/26', 'C', 2026, 16),
('25/26', 'C', 2026, 21)
;

-- Team D corvee weeks
INSERT INTO "CorveePlanning" ("season", "team_letter", "year", "week") VALUES
('25/26', 'D', 2025, 39),
('25/26', 'D', 2025, 44),
('25/26', 'D', 2025, 49),
('25/26', 'D', 2026, 2),
('25/26', 'D', 2026, 7),
('25/26', 'D', 2026, 12),
('25/26', 'D', 2026, 17)
;

-- Team E corvee weeks
INSERT INTO "CorveePlanning" ("season", "team_letter", "year", "week") VALUES
('25/26', 'E', 2025, 40),
('25/26', 'E', 2025, 45),
('25/26', 'E', 2025, 50),
('25/26', 'E', 2026, 3),
('25/26', 'E', 2026, 8),
('25/26', 'E', 2026, 13),
('25/26', 'E', 2026, 18)
;                