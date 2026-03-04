import { Controller, Get, Param, Query } from '@nestjs/common'
import { ChannelAnalyticsService } from './channel-analytics.service'

type Period = 'month' | 'all'

@Controller('channels/:slug/analytics')
export class ChannelAnalyticsController {
  constructor(private readonly service: ChannelAnalyticsService) {}

  @Get('overview')
  async getOverview(
    @Param('slug') slug: string,
    @Query('period') periodRaw?: string
  ) {
    const period: Period = periodRaw === 'all' ? 'all' : 'month'
    return this.service.getOverview({ slug, period })
  }

  @Get('monthly-stats')
  async getMonthlyStats(@Param('slug') slug: string) {
    return this.service.getMonthlyStats({ slug })
  }

  @Get('stats')
  async getStats(@Param('slug') slug: string) {
    return this.service.getChannelStats({ slug })
  }
}
