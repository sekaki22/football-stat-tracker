-- CreateTable
CREATE TABLE "FineInformation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fine_type" TEXT NOT NULL UNIQUE,
    "fine_amount" INTEGER NOT NULL DEFAULT 0,
    "fine_description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Fines" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fine_type_id" INTEGER NOT NULL,
    "fine_amount" INTEGER NOT NULL DEFAULT 0,
    "player_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Fines_fine_type_id_fkey" FOREIGN KEY ("fine_type_id") REFERENCES "FineInformation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fines_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "FineInformation" ("fine_type", "fine_amount", "fine_description", "createdAt", "updatedAt") VALUES
('Poepen in de kleedkamer', 10, 'Af te kopen voor heel seizoen kost €50', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Roken en/of alcohol drinken op voetbalschoenen en/of Quick clubkleding', 2, 'Als je zowel roken als alcohol drinkt krijg je een boete van €4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Te laat afmelden voor training', 5, 'Te laat afmelden voor training bij BOA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Niet opkomen dagen tijdens een training', 10, 'Niet opkomen dagen tijdens een training', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Te laat bij wedstrijd', 5, 'Te laat bij wedstrijd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Te laat bij training', 2, 'Per 15 minuten tellend vanaf 20:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Niet op komen dagen tijdens een wedstrijd zonder af te melden', 20, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Domme gele kaart', 5, 'Bijvoorbeeld voor schelden naar scheids of natrappen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Domme rode kaart', 10, 'Bijvoorbeeld voor schelden naar scheids of natrappen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Handmatige invoer', 0, 'Handmatige invoer van een boete, kan ook een min bedrag zijn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);