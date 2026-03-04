import { IsEnum, IsOptional, IsString, IsNumber, Matches, Min, MaxLength } from 'class-validator'
import { ChannelVisibility, ChannelJoinPolicy } from '@prisma/client'

export class UpdateChannelSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(100)
  slug?: string

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
  @IsString()
  @Matches(/^(https?:\/\/.*)?$/, { message: 'telegramUrl must start with http:// or https://' })
  telegramUrl?: string | null

  @IsOptional()
  @IsString()
  @Matches(/^(https?:\/\/.*)?$/, { message: 'twitterUrl must start with http:// or https://' })
  twitterUrl?: string | null

  @IsOptional()
  @IsString()
  @Matches(/^(https?:\/\/.*)?$/, { message: 'instagramUrl must start with http:// or https://' })
  instagramUrl?: string | null

  @IsOptional()
  @IsString()
  @Matches(/^(https?:\/\/.*)?$/, { message: 'vkUrl must start with http:// or https://' })
  vkUrl?: string | null

  @IsOptional()
  @IsString()
  @Matches(/^(https?:\/\/.*)?$/, { message: 'websiteUrl must start with http:// or https://' })
  websiteUrl?: string | null

  @IsOptional()
  @IsNumber()
  @Min(0)
  startingBankroll?: number

  @IsOptional()
  @IsString()
  bankrollCurrency?: string | null
}
