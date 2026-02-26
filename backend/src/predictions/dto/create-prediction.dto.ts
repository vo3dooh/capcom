import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export enum CompetitorTypeDto {
  team = 'team',
  player = 'player'
}

export class CreatePredictionDto {
  @IsString()
  sportId!: string

  @IsOptional()
  @IsString()
  leagueName?: string

  @IsString()
  homeName!: string

  @IsString()
  awayName!: string

  @IsOptional()
  @IsString()
  homeLogoUrl?: string

  @IsOptional()
  @IsString()
  awayLogoUrl?: string

  @IsOptional()
  @IsEnum(CompetitorTypeDto)
  competitorType?: CompetitorTypeDto

  @IsDateString()
  startTime!: string

  @IsNumber()
  @Min(1.01)
  @Max(1000)
  odds!: number

  @IsNumber()
  @Min(0.01)
  @Max(1000000000)
  stake!: number

  @IsString()
  market!: string

  @IsString()
  selection!: string
}