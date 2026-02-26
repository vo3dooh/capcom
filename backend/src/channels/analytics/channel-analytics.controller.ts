import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { ChannelAnalyticsService } from './channel-analytics.service'

type Period = 'month' | 'all'

@Controller('channels/:slug/analytics')
@UseGuards(JwtAuthGuard)
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
}