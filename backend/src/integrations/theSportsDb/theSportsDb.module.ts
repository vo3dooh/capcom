import { Module } from '@nestjs/common';
import { TheSportsDbService } from './theSportsDb.service';
import { LogoCacheService } from '../../shared/files/logo-cache.service';

@Module({
  providers: [TheSportsDbService, LogoCacheService],
  exports: [TheSportsDbService],
})
export class TheSportsDbModule {}
