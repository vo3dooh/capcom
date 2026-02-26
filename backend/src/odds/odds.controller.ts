import { Controller, Get, Param, Query } from '@nestjs/common'
import { GetEventOddsQueryDto, GetOddsEventsQueryDto } from './dto/odds.dto'
import { OddsService } from './odds.service'

@Controller('odds')
export class OddsController {
  constructor(private readonly odds: OddsService) {}

  @Get('sports')
  listSports() {
    return this.odds.listSports()
  }

  @Get('sports-mapped')
  listSportsMapped() {
    return this.odds.listSportsMapped()
  }

  @Get('events')
  listEvents(@Query() q: GetOddsEventsQueryDto) {
    return this.odds.listEvents({
      sportKey: q.sportKey,
      regions: q.regions,
      markets: q.markets,
      bookmakers: q.bookmakers,
      oddsFormat: q.oddsFormat,
      dateFormat: q.dateFormat,
    })
  }

  @Get('events/:eventId/odds')
  getEventOdds(@Param('eventId') eventId: string, @Query() q: GetEventOddsQueryDto) {
    return this.odds.getEventOdds(eventId, {
      sportKey: q.sportKey,
      regions: q.regions,
      markets: q.markets,
      bookmakers: q.bookmakers,
      oddsFormat: q.oddsFormat,
      dateFormat: q.dateFormat,
    })
  }
}