import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { SportsService } from './sports.service'

@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  list() {
    return this.sportsService.list()
  }
}