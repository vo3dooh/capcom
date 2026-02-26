import { IsEnum } from 'class-validator'

export enum PredictionResultDto {
  win = 'win',
  loss = 'loss',
  void = 'void'
}

export class SettlePredictionDto {
  @IsEnum(PredictionResultDto)
  result!: PredictionResultDto
}