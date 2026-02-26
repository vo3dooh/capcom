import { Module } from '@nestjs/common'
import { ChannelsController } from './channels.controller'
import { ChannelsService } from './channels.service'
import { ChannelAnalyticsController } from './analytics/channel-analytics.controller'
import { ChannelAnalyticsService } from './analytics/channel-analytics.service'

@Module({
  controllers: [ChannelsController, ChannelAnalyticsController],
  providers: [ChannelsService, ChannelAnalyticsService],
  exports: [ChannelsService]
})
export class ChannelsModule {}