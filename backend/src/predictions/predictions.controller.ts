import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PredictionsService } from './predictions.service'
import { CreatePredictionDto } from './dto/create-prediction.dto'
import { SettlePredictionDto } from './dto/settle-prediction.dto'

@Controller()
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('channels/:slug/predictions')
  create(@Req() req: any, @Param('slug') slug: string, @Body() dto: CreatePredictionDto) {
    return this.predictionsService.create(slug, req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('channels/:slug/predictions')
  list(@Req() req: any, @Param('slug') slug: string, @Query('take') take?: string, @Query('skip') skip?: string) {
    const takeNum = take ? Number(take) : undefined
    const skipNum = skip ? Number(skip) : undefined
    return this.predictionsService.list(slug, req.user.id, takeNum, skipNum)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('predictions/:id/settle')
  settle(@Req() req: any, @Param('id') id: string, @Body() dto: SettlePredictionDto) {
    return this.predictionsService.settle(id, req.user.id, dto.result)
  }

  @UseGuards(JwtAuthGuard)
  @Post('channels/:slug/stats/recalc')
  recalcStats(@Req() req: any, @Param('slug') slug: string) {
    return this.predictionsService.recalcChannelStats(slug, req.user.id)
  }
}