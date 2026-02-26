-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "predictionsVisibility" TEXT NOT NULL DEFAULT 'public',
    "joinPolicy" TEXT NOT NULL DEFAULT 'open',
    "ownerId" TEXT NOT NULL,
    "startingBankroll" REAL NOT NULL DEFAULT 1000,
    "currentBankroll" REAL NOT NULL DEFAULT 1000,
    "bankrollCurrency" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "membersCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Channel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("avatarUrl", "bankrollCurrency", "coverUrl", "createdAt", "currentBankroll", "deletedAt", "description", "id", "joinPolicy", "membersCount", "name", "ownerId", "slug", "startingBankroll", "updatedAt", "visibility") SELECT "avatarUrl", "bankrollCurrency", "coverUrl", "createdAt", "currentBankroll", "deletedAt", "description", "id", "joinPolicy", "membersCount", "name", "ownerId", "slug", "startingBankroll", "updatedAt", "visibility" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_slug_key" ON "Channel"("slug");
CREATE INDEX "Channel_ownerId_idx" ON "Channel"("ownerId");
CREATE INDEX "Channel_visibility_idx" ON "Channel"("visibility");
CREATE INDEX "Channel_deletedAt_idx" ON "Channel"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
