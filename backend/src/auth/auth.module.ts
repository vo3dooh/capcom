import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || "dev_secret",
            signOptions: { expiresIn: "7d" }
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, PrismaService, JwtStrategy]
})
export class AuthModule {}
