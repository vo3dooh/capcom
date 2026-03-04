import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export enum ChannelVisibilityDto {
  public = 'public',
  private = 'private',
  unlisted = 'unlisted'
}

export enum ChannelJoinPolicyDto {
  open = 'open',
  request = 'request',
  inviteOnly = 'inviteOnly'
}

export class CreateChannelDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string

  @IsOptional()
  @IsString()
  coverUrl?: string

  @IsOptional()
  @IsEnum(ChannelVisibilityDto)
  visibility?: ChannelVisibilityDto

  @IsOptional()
  @IsEnum(ChannelJoinPolicyDto)
  joinPolicy?: ChannelJoinPolicyDto

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000000)
  startingBankroll?: number

  @IsOptional()
  @IsString()
  bankrollCurrency?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sportIds?: string[]
}
