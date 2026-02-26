import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common"
import { UsersService } from "./users.service"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { CurrentUser } from "../auth/current-user.decorator"
import { UpdateMySettingsDto } from "./dto/update-my-settings.dto"

@Controller("users")
export class UsersController {
    constructor(private users: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get("me")
    me(@CurrentUser() user: any) {
        return this.users.getMyProfile(user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Get("me/settings")
    mySettings(@CurrentUser() user: any) {
        return this.users.getMySettings(user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Patch("me/settings")
    updateMySettings(@CurrentUser() user: any, @Body() dto: UpdateMySettingsDto) {
        return this.users.updateMySettings(user.id, dto)
    }

    @Get(":handle")
    byHandle(@Param("handle") handle: string) {
        return this.users.getPublicProfileByHandle(handle)
    }
}
