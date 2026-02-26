import { Module } from '@nestjs/common'
import { LogoCacheService } from './logo-cache.service'

@Module({
  providers: [LogoCacheService],
  exports: [LogoCacheService],
})
export class FilesModule {}