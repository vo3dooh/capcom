import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ChannelsService } from './channels.service'
import { CreateChannelDto } from './dto/create-channel.dto'
import { UpdateChannelSettingsDto } from './dto/update-channel-settings.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard'

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateChannelDto) {
    return this.channelsService.create(req.user.id, dto)
  }

  @Get()
  list(@Query('take') take?: string, @Query('skip') skip?: string) {
    const takeNum = take ? Number(take) : undefined
    const skipNum = skip ? Number(skip) : undefined
    return this.channelsService.listPublic(takeNum, skipNum)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  getBySlug(@Req() req: any, @Param('slug') slug: string) {
    return this.channelsService.getBySlug(slug, req.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':slug/settings')
  updateSettings(@Req() req: any, @Param('slug') slug: string, @Body() dto: UpdateChannelSettingsDto) {
    return this.channelsService.updateSettings(slug, req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/join')
  join(@Req() req: any, @Param('slug') slug: string) {
    return this.channelsService.join(slug, req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/leave')
  leave(@Req() req: any, @Param('slug') slug: string) {
    return this.channelsService.leave(slug, req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  remove(@Req() req: any, @Param('slug') slug: string) {
    return this.channelsService.remove(slug, req.user.id)
  }
}
