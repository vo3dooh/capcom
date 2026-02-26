import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../prisma/prisma.module'
import { OddsController } from './odds.controller'
import { OddsService } from './odds.service'

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [OddsController],
  providers: [OddsService],
  exports: [OddsService],
})
export class OddsModule {}