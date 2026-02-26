import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { SportsModule } from './sports/sports.module';
import { PredictionsModule } from './predictions/predictions.module';
import { OddsModule } from './odds/odds.module';
import { CompetitorsModule } from './competitors/competitors.module';
import { FilesModule } from './shared/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ChannelsModule,
    SportsModule,
    PredictionsModule,
    OddsModule,
    CompetitorsModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
