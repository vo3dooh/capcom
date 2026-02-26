import { IsOptional, IsString } from 'class-validator'

export class GetOddsEventsQueryDto {
  @IsString()
  sportKey!: string

  @IsOptional()
  @IsString()
  regions?: string

  @IsOptional()
  @IsString()
  markets?: string

  @IsOptional()
  @IsString()
  bookmakers?: string

  @IsOptional()
  @IsString()
  oddsFormat?: string

  @IsOptional()
  @IsString()
  dateFormat?: string
}

export class GetEventOddsQueryDto {
  @IsString()
  sportKey!: string

  @IsOptional()
  @IsString()
  regions?: string

  @IsOptional()
  @IsString()
  markets?: string

  @IsOptional()
  @IsString()
  bookmakers?: string

  @IsOptional()
  @IsString()
  oddsFormat?: string

  @IsOptional()
  @IsString()
  dateFormat?: string
}