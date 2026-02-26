-- AlterTable
ALTER TABLE "League" ADD COLUMN "tsdbLeagueId" TEXT;
ALTER TABLE "League" ADD COLUMN "tsdbSportName" TEXT;

-- CreateIndex
CREATE INDEX "League_tsdbLeagueId_idx" ON "League"("tsdbLeagueId");
