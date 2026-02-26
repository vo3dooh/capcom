import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService
    ) {}

    async register(email: string, password: string, username?: string) {
        const normalizedEmail = email.trim().toLowerCase();

        const exists = await this.prisma.user.findUnique({
            where: { email: normalizedEmail }
        });
        if (exists) throw new BadRequestException("Email already in use");

        if (username) {
            const u = await this.prisma.user.findUnique({ where: { username } });
            if (u) throw new BadRequestException("Username already in use");
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new BadRequestException(
                "Пароль должен содержать минимум 8 символов, заглавную и строчную букву, а также цифру."
            );
        }

        const passHash = await argon2.hash(password);

        const user = await this.prisma.user.create({
            data: { email: normalizedEmail, passHash, username: username || null },
            select: { id: true, email: true, role: true }
        });

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role
        });

        return { accessToken };
    }

    async login(email: string, password: string) {
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true, role: true, passHash: true }
        });

        if (!user) throw new UnauthorizedException("Неверный email или пароль");

        const ok = await argon2.verify(user.passHash, password);
        if (!ok) throw new UnauthorizedException("Неверный email или пароль");

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role
        });

        return { accessToken };
    }
}
