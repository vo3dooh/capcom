import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { TheSportsDbModule } from "../integrations/theSportsDb/theSportsDb.module";
import { CompetitorLogoService } from "./competitorLogo.service";

@Module({
    imports: [PrismaModule, TheSportsDbModule],
    providers: [CompetitorLogoService],
    exports: [CompetitorLogoService]
})
export class CompetitorsModule {}