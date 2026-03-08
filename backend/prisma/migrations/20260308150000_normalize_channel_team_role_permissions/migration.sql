CREATE TABLE "ChannelTeamRolePermission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "channelId" TEXT NOT NULL,
  "roleGroup" TEXT NOT NULL,
  "publishFree" BOOLEAN NOT NULL DEFAULT false,
  "publishPaid" BOOLEAN NOT NULL DEFAULT false,
  "paidModuleAccess" BOOLEAN NOT NULL DEFAULT false,
  "directMessagesAccess" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ChannelTeamRolePermission_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ChannelTeamRolePermission_channelId_roleGroup_key" ON "ChannelTeamRolePermission"("channelId", "roleGroup");
CREATE INDEX "ChannelTeamRolePermission_channelId_idx" ON "ChannelTeamRolePermission"("channelId");

INSERT INTO "ChannelTeamRolePermission" (
  "id",
  "channelId",
  "roleGroup",
  "publishFree",
  "publishPaid",
  "paidModuleAccess",
  "directMessagesAccess",
  "updatedAt"
)
SELECT
  lower(hex(randomblob(16))),
  "id",
  'analyst',
  true,
  true,
  false,
  false,
  CURRENT_TIMESTAMP
FROM "Channel";

INSERT INTO "ChannelTeamRolePermission" (
  "id",
  "channelId",
  "roleGroup",
  "publishFree",
  "publishPaid",
  "paidModuleAccess",
  "directMessagesAccess",
  "updatedAt"
)
SELECT
  lower(hex(randomblob(16))),
  "id",
  'manager',
  false,
  false,
  true,
  true,
  CURRENT_TIMESTAMP
FROM "Channel";

UPDATE "ChannelTeamRolePermission"
SET
  "publishFree" = COALESCE(
    (
      SELECT json_extract("Channel"."teamRolePermissions", '$.moderator.publishFree')
      FROM "Channel"
      WHERE "Channel"."id" = "ChannelTeamRolePermission"."channelId"
    ),
    "publishFree"
  ),
  "publishPaid" = COALESCE(
    (
      SELECT json_extract("Channel"."teamRolePermissions", '$.moderator.publishPaid')
      FROM "Channel"
      WHERE "Channel"."id" = "ChannelTeamRolePermission"."channelId"
    ),
    "publishPaid"
  ),
  "paidModuleAccess" = COALESCE(
    (
      SELECT json_extract("Channel"."teamRolePermissions", '$.moderator.paidModuleAccess')
      FROM "Channel"
      WHERE "Channel"."id" = "ChannelTeamRolePermission"."channelId"
    ),
    "paidModuleAccess"
  ),
  "directMessagesAccess" = COALESCE(
    (
      SELECT json_extract("Channel"."teamRolePermissions", '$.moderator.directMessagesAccess')
      FROM "Channel"
      WHERE "Channel"."id" = "ChannelTeamRolePermission"."channelId"
    ),
    "directMessagesAccess"
  )
WHERE "roleGroup" = 'analyst';

UPDATE "ChannelTeamRolePermission"
SET
  "publishFree" = COALESCE(
    (
      SELECT json_extract("Channel"."teamRolePermissions", '$.member.publishFree')
      FROM "Channel"
      WHERE "Channel"."id" = "ChannelTeamRolePermission"."channelId"
    ),
    "publishFree"
  ),
  "publishPaid" = COALESCE(
    (
      SELECT json_extract("Channel"."teamRolePermissions", '$.member.publishPaid')
      FROM "Channel"
      WHERE "Channel"."id" = "ChannelTeamRolePermission"."channelId"
    ),
    "publishPaid"
  ),
  "paidModuleAccess" = COALESCE(
    (
      SELECT json_extract("Channel"."teamRolePermissions", '$.member.paidModuleAccess')
      FROM "Channel"
      WHERE "Channel"."id" = "ChannelTeamRolePermission"."channelId"
    ),
    "paidModuleAccess"
  ),
  "directMessagesAccess" = COALESCE(
    (
      SELECT json_extract("Channel"."teamRolePermissions", '$.member.directMessagesAccess')
      FROM "Channel"
      WHERE "Channel"."id" = "ChannelTeamRolePermission"."channelId"
    ),
    "directMessagesAccess"
  )
WHERE "roleGroup" = 'manager';

ALTER TABLE "Channel" DROP COLUMN "teamRolePermissions";
