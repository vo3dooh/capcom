-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChannelBankrollLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChannelBankrollLog_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChannelBankrollLog" ("amount", "channelId", "id", "type") SELECT "amount", "channelId", "id", "type" FROM "ChannelBankrollLog";
DROP TABLE "ChannelBankrollLog";
ALTER TABLE "new_ChannelBankrollLog" RENAME TO "ChannelBankrollLog";
CREATE INDEX "ChannelBankrollLog_channelId_idx" ON "ChannelBankrollLog"("channelId");
CREATE INDEX "ChannelBankrollLog_type_idx" ON "ChannelBankrollLog"("type");
CREATE TABLE "new_ChannelInvite" (
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
INSERT INTO "new_ChannelInvite" ("channelId", "email", "id", "invitedById", "invitedUserId", "status", "token") SELECT "channelId", "email", "id", "invitedById", "invitedUserId", "status", "token" FROM "ChannelInvite";
DROP TABLE "ChannelInvite";
ALTER TABLE "new_ChannelInvite" RENAME TO "ChannelInvite";
CREATE UNIQUE INDEX "ChannelInvite_token_key" ON "ChannelInvite"("token");
CREATE INDEX "ChannelInvite_channelId_status_idx" ON "ChannelInvite"("channelId", "status");
CREATE INDEX "ChannelInvite_invitedById_idx" ON "ChannelInvite"("invitedById");
CREATE INDEX "ChannelInvite_invitedUserId_idx" ON "ChannelInvite"("invitedUserId");
CREATE INDEX "ChannelInvite_expiresAt_idx" ON "ChannelInvite"("expiresAt");
CREATE TABLE "new_ChannelTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ChannelTag" ("id", "name", "slug") SELECT "id", "name", "slug" FROM "ChannelTag";
DROP TABLE "ChannelTag";
ALTER TABLE "new_ChannelTag" RENAME TO "ChannelTag";
CREATE UNIQUE INDEX "ChannelTag_slug_key" ON "ChannelTag"("slug");
CREATE TABLE "new_ChannelTagOnChannel" (
    "channelId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("channelId", "tagId"),
    CONSTRAINT "ChannelTagOnChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelTagOnChannel_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ChannelTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChannelTagOnChannel" ("channelId", "tagId") SELECT "channelId", "tagId" FROM "ChannelTagOnChannel";
DROP TABLE "ChannelTagOnChannel";
ALTER TABLE "new_ChannelTagOnChannel" RENAME TO "ChannelTagOnChannel";
CREATE INDEX "ChannelTagOnChannel_tagId_idx" ON "ChannelTagOnChannel"("tagId");
CREATE TABLE "new_Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "logoUrl" TEXT,
    "sportId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Competitor_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Competitor" ("id", "logoUrl", "name", "sportId", "type") SELECT "id", "logoUrl", "name", "sportId", "type" FROM "Competitor";
DROP TABLE "Competitor";
ALTER TABLE "new_Competitor" RENAME TO "Competitor";
CREATE INDEX "Competitor_sportId_idx" ON "Competitor"("sportId");
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sportId" TEXT NOT NULL,
    "leagueId" TEXT,
    "homeCompetitorId" TEXT NOT NULL,
    "awayCompetitorId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_homeCompetitorId_fkey" FOREIGN KEY ("homeCompetitorId") REFERENCES "Competitor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_awayCompetitorId_fkey" FOREIGN KEY ("awayCompetitorId") REFERENCES "Competitor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("awayCompetitorId", "homeCompetitorId", "id", "leagueId", "sportId", "startTime") SELECT "awayCompetitorId", "homeCompetitorId", "id", "leagueId", "sportId", "startTime" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_sportId_idx" ON "Event"("sportId");
CREATE INDEX "Event_leagueId_idx" ON "Event"("leagueId");
CREATE INDEX "Event_startTime_idx" ON "Event"("startTime");
CREATE TABLE "new_League" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "League_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_League" ("id", "name", "sportId") SELECT "id", "name", "sportId" FROM "League";
DROP TABLE "League";
ALTER TABLE "new_League" RENAME TO "League";
CREATE INDEX "League_sportId_idx" ON "League"("sportId");
CREATE TABLE "new_Sport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Sport" ("id", "name", "slug") SELECT "id", "name", "slug" FROM "Sport";
DROP TABLE "Sport";
ALTER TABLE "new_Sport" RENAME TO "Sport";
CREATE UNIQUE INDEX "Sport_slug_key" ON "Sport"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ChannelBan_channelId_idx" ON "ChannelBan"("channelId");

-- CreateIndex
CREATE INDEX "ChannelBan_userId_idx" ON "ChannelBan"("userId");

-- CreateIndex
CREATE INDEX "ChannelBan_expiresAt_idx" ON "ChannelBan"("expiresAt");

-- CreateIndex
CREATE INDEX "ChannelJoinRequest_channelId_status_idx" ON "ChannelJoinRequest"("channelId", "status");

-- CreateIndex
CREATE INDEX "ChannelJoinRequest_userId_status_idx" ON "ChannelJoinRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "ChannelJoinRequest_decidedById_idx" ON "ChannelJoinRequest"("decidedById");

-- CreateIndex
CREATE INDEX "ChannelLink_channelId_sortOrder_idx" ON "ChannelLink"("channelId", "sortOrder");

-- CreateIndex
CREATE INDEX "ChannelMember_channelId_role_idx" ON "ChannelMember"("channelId", "role");

-- CreateIndex
CREATE INDEX "ChannelMember_channelId_status_idx" ON "ChannelMember"("channelId", "status");

-- CreateIndex
CREATE INDEX "ChannelMember_userId_idx" ON "ChannelMember"("userId");

-- CreateIndex
CREATE INDEX "ChannelSport_sportId_idx" ON "ChannelSport"("sportId");

-- CreateIndex
CREATE INDEX "Prediction_channelId_idx" ON "Prediction"("channelId");

-- CreateIndex
CREATE INDEX "Prediction_authorId_idx" ON "Prediction"("authorId");

-- CreateIndex
CREATE INDEX "Prediction_eventId_idx" ON "Prediction"("eventId");

-- CreateIndex
CREATE INDEX "Prediction_result_idx" ON "Prediction"("result");
