import { Module } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TheSportsDbModule } from '../integrations/theSportsDb/theSportsDb.module';
import { FilesModule } from '../shared/files/files.module';

@Module({
  imports: [PrismaModule, TheSportsDbModule, FilesModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
