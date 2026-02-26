/*
  Warnings:

  - Added the required column `ownerId` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ChannelMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ChannelLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChannelLink_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChannelInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedById" TEXT NOT NULL,
    "invitedUserId" TEXT,
    "email" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    CONSTRAINT "ChannelInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChannelInvite_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChannelInvite_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChannelJoinRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "decidedAt" DATETIME,
    "decidedById" TEXT,
    CONSTRAINT "ChannelJoinRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChannelJoinRequest_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChannelBan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "bannedById" TEXT NOT NULL,
    CONSTRAINT "ChannelBan_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChannelBan_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChannelBankrollLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChannelBankrollLog_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChannelSport" (
    "channelId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,

    PRIMARY KEY ("channelId", "sportId"),
    CONSTRAINT "ChannelSport_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChannelTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChannelTagOnChannel" (
    "channelId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("channelId", "tagId"),
    CONSTRAINT "ChannelTagOnChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelTagOnChannel_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ChannelTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
INSERT INTO "new_Channel" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_slug_key" ON "Channel"("slug");
CREATE INDEX "Channel_ownerId_idx" ON "Channel"("ownerId");
CREATE INDEX "Channel_visibility_idx" ON "Channel"("visibility");
CREATE INDEX "Channel_deletedAt_idx" ON "Channel"("deletedAt");
CREATE TABLE "new_ChannelMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "leftAt" DATETIME,
    CONSTRAINT "ChannelMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelMember_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChannelMember" ("channelId", "id", "role", "userId") SELECT "channelId", "id", "role", "userId" FROM "ChannelMember";
DROP TABLE "ChannelMember";
ALTER TABLE "new_ChannelMember" RENAME TO "ChannelMember";
CREATE INDEX "ChannelMember_channelId_role_idx" ON "ChannelMember"("channelId", "role");
CREATE INDEX "ChannelMember_channelId_status_idx" ON "ChannelMember"("channelId", "status");
CREATE INDEX "ChannelMember_userId_idx" ON "ChannelMember"("userId");
CREATE UNIQUE INDEX "ChannelMember_userId_channelId_key" ON "ChannelMember"("userId", "channelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ChannelLink_channelId_sortOrder_idx" ON "ChannelLink"("channelId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelLink_channelId_type_key" ON "ChannelLink"("channelId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelInvite_token_key" ON "ChannelInvite"("token");

-- CreateIndex
CREATE INDEX "ChannelInvite_channelId_status_idx" ON "ChannelInvite"("channelId", "status");

-- CreateIndex
CREATE INDEX "ChannelInvite_invitedById_idx" ON "ChannelInvite"("invitedById");

-- CreateIndex
CREATE INDEX "ChannelInvite_invitedUserId_idx" ON "ChannelInvite"("invitedUserId");

-- CreateIndex
CREATE INDEX "ChannelInvite_expiresAt_idx" ON "ChannelInvite"("expiresAt");

-- CreateIndex
CREATE INDEX "ChannelJoinRequest_channelId_status_idx" ON "ChannelJoinRequest"("channelId", "status");

-- CreateIndex
CREATE INDEX "ChannelJoinRequest_userId_status_idx" ON "ChannelJoinRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "ChannelJoinRequest_decidedById_idx" ON "ChannelJoinRequest"("decidedById");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelJoinRequest_channelId_userId_key" ON "ChannelJoinRequest"("channelId", "userId");

-- CreateIndex
CREATE INDEX "ChannelBan_channelId_idx" ON "ChannelBan"("channelId");

-- CreateIndex
CREATE INDEX "ChannelBan_userId_idx" ON "ChannelBan"("userId");

-- CreateIndex
CREATE INDEX "ChannelBan_expiresAt_idx" ON "ChannelBan"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelBan_channelId_userId_key" ON "ChannelBan"("channelId", "userId");

-- CreateIndex
CREATE INDEX "ChannelBankrollLog_channelId_idx" ON "ChannelBankrollLog"("channelId");

-- CreateIndex
CREATE INDEX "ChannelBankrollLog_type_idx" ON "ChannelBankrollLog"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Sport_slug_key" ON "Sport"("slug");

-- CreateIndex
CREATE INDEX "ChannelSport_sportId_idx" ON "ChannelSport"("sportId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelTag_slug_key" ON "ChannelTag"("slug");

-- CreateIndex
CREATE INDEX "ChannelTagOnChannel_tagId_idx" ON "ChannelTagOnChannel"("tagId");
