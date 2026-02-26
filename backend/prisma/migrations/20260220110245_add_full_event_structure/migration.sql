/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ChannelBankrollLog` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `ChannelBankrollLog` table. All the data in the column will be lost.
  - You are about to drop the column `acceptedAt` on the `ChannelInvite` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ChannelInvite` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `ChannelInvite` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ChannelTag` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ChannelTagOnChannel` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Sport` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ChannelBan_expiresAt_idx";

-- DropIndex
DROP INDEX "ChannelBan_userId_idx";

-- DropIndex
DROP INDEX "ChannelBan_channelId_idx";

-- DropIndex
DROP INDEX "ChannelJoinRequest_decidedById_idx";

-- DropIndex
DROP INDEX "ChannelJoinRequest_userId_status_idx";

-- DropIndex
DROP INDEX "ChannelJoinRequest_channelId_status_idx";

-- DropIndex
DROP INDEX "ChannelLink_channelId_sortOrder_idx";

-- DropIndex
DROP INDEX "ChannelMember_userId_idx";

-- DropIndex
DROP INDEX "ChannelMember_channelId_status_idx";

-- DropIndex
DROP INDEX "ChannelMember_channelId_role_idx";

-- DropIndex
DROP INDEX "ChannelSport_sportId_idx";

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    CONSTRAINT "League_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "logoUrl" TEXT,
    "sportId" TEXT NOT NULL,
    CONSTRAINT "Competitor_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sportId" TEXT NOT NULL,
    "leagueId" TEXT,
    "homeCompetitorId" TEXT NOT NULL,
    "awayCompetitorId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    CONSTRAINT "Event_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_homeCompetitorId_fkey" FOREIGN KEY ("homeCompetitorId") REFERENCES "Competitor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_awayCompetitorId_fkey" FOREIGN KEY ("awayCompetitorId") REFERENCES "Competitor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "odds" REAL NOT NULL,
    "stake" REAL NOT NULL,
    "market" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" DATETIME,
    CONSTRAINT "Prediction_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prediction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prediction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChannelBankrollLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "ChannelBankrollLog_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChannelBankrollLog" ("amount", "channelId", "id", "type") SELECT "amount", "channelId", "id", "type" FROM "ChannelBankrollLog";
DROP TABLE "ChannelBankrollLog";
ALTER TABLE "new_ChannelBankrollLog" RENAME TO "ChannelBankrollLog";
CREATE TABLE "new_ChannelInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedById" TEXT NOT NULL,
    "invitedUserId" TEXT,
    "email" TEXT,
    CONSTRAINT "ChannelInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChannelInvite_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChannelInvite_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChannelInvite" ("channelId", "email", "id", "invitedById", "invitedUserId", "status", "token") SELECT "channelId", "email", "id", "invitedById", "invitedUserId", "status", "token" FROM "ChannelInvite";
DROP TABLE "ChannelInvite";
ALTER TABLE "new_ChannelInvite" RENAME TO "ChannelInvite";
CREATE UNIQUE INDEX "ChannelInvite_token_key" ON "ChannelInvite"("token");
CREATE TABLE "new_ChannelTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL
);
INSERT INTO "new_ChannelTag" ("id", "name", "slug") SELECT "id", "name", "slug" FROM "ChannelTag";
DROP TABLE "ChannelTag";
ALTER TABLE "new_ChannelTag" RENAME TO "ChannelTag";
CREATE UNIQUE INDEX "ChannelTag_slug_key" ON "ChannelTag"("slug");
CREATE TABLE "new_ChannelTagOnChannel" (
    "channelId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("channelId", "tagId"),
    CONSTRAINT "ChannelTagOnChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelTagOnChannel_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ChannelTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChannelTagOnChannel" ("channelId", "tagId") SELECT "channelId", "tagId" FROM "ChannelTagOnChannel";
DROP TABLE "ChannelTagOnChannel";
ALTER TABLE "new_ChannelTagOnChannel" RENAME TO "ChannelTagOnChannel";
CREATE TABLE "new_Sport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Sport" ("id", "name", "slug") SELECT "id", "name", "slug" FROM "Sport";
DROP TABLE "Sport";
ALTER TABLE "new_Sport" RENAME TO "Sport";
CREATE UNIQUE INDEX "Sport_slug_key" ON "Sport"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
