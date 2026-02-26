import { IsArray, IsEmail, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

const socialTypes = ["telegram", "twitter", "instagram", "website"] as const

class SocialDto {
    @IsIn(socialTypes as unknown as string[])
    type!: (typeof socialTypes)[number]

    @IsString()
    @MaxLength(2048)
    url!: string
}

export class UpdateMySettingsDto {
    @IsOptional()
    @IsEmail()
    @MaxLength(320)
    email?: string

    @IsOptional()
    @IsString()
    @MaxLength(80)
    username?: string

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    about?: string

    @IsOptional()
    @IsString()
    @MaxLength(2048)
    avatarUrl?: string | null

    @IsOptional()
    @IsString()
    @MaxLength(2048)
    coverUrl?: string | null

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialDto)
    socials?: SocialDto[]
}
