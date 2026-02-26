import { IsEnum, IsOptional, IsString, IsNumber, Min, MaxLength } from 'class-validator'
import { ChannelVisibility, ChannelJoinPolicy, ChannelPredictionsVisibility } from '@prisma/client'

export class UpdateChannelSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string | null

  @IsOptional()
  @IsString()
  coverUrl?: string | null

  @IsOptional()
  @IsEnum(ChannelVisibility)
  visibility?: ChannelVisibility

  @IsOptional()
  @IsEnum(ChannelJoinPolicy)
  joinPolicy?: ChannelJoinPolicy

  @IsOptional()
  @IsEnum(ChannelPredictionsVisibility)
  predictionsVisibility?: ChannelPredictionsVisibility

  @IsOptional()
  @IsNumber()
  @Min(0)
  startingBankroll?: number

  @IsOptional()
  @IsString()
  bankrollCurrency?: string | null
}