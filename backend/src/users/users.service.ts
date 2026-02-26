import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { UpdateMySettingsDto } from "./dto/update-my-settings.dto"

function toHandle(input: string) {
    const s = input.trim().toLowerCase()
    const cleaned = s
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .replace(/^_+|_+$/g, "")
    return cleaned.slice(0, 24) || "user"
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async getMyProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                handle: true,
                avatarUrl: true,
                coverUrl: true,
                about: true,
                role: true,
                createdAt: true,
                socials: {
                    select: { type: true, url: true },
                    orderBy: { type: "asc" }
                }
            }
        })

        if (!user) throw new NotFoundException("User not found")

        const displayName = user.username || "User"
        const handle = user.handle || toHandle(displayName)

        return {
            id: user.id,
            displayName,
            handle,
            avatarUrl: user.avatarUrl,
            coverUrl: user.coverUrl,
            about: user.about || "",
            role: user.role,
            createdAt: user.createdAt,
            badges: [],
            verificationStatus: "Not verified",
            specialties: [],
            approachTags: [],
            socials: user.socials.map((s) => ({ type: s.type, label: String(s.type), url: s.url })),
            channels: []
        }
    }

    async getPublicProfileByHandle(handle: string) {
        const user = await this.prisma.user.findUnique({
            where: { handle },
            select: {
                id: true,
                username: true,
                handle: true,
                avatarUrl: true,
                coverUrl: true,
                about: true,
                createdAt: true,
                socials: {
                    select: { type: true, url: true },
                    orderBy: { type: "asc" }
                }
            }
        })

        if (!user) throw new NotFoundException("User not found")

        const displayName = user.username || "User"

        return {
            id: user.id,
            displayName,
            handle: user.handle || handle,
            avatarUrl: user.avatarUrl,
            coverUrl: user.coverUrl,
            about: user.about || "",
            createdAt: user.createdAt,
            badges: [],
            verificationStatus: "Not verified",
            specialties: [],
            approachTags: [],
            socials: user.socials.map((s) => ({ type: s.type, label: String(s.type), url: s.url })),
            channels: []
        }
    }

    async getMySettings(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
                coverUrl: true,
                about: true,
                socials: {
                    select: { type: true, url: true },
                    orderBy: { type: "asc" }
                }
            }
        })

        if (!user) throw new NotFoundException("User not found")

        return {
            id: user.id,
            email: user.email,
            username: user.username || "",
            about: user.about || "",
            avatarUrl: user.avatarUrl,
            coverUrl: user.coverUrl,
            socials: user.socials.map((s) => ({ type: s.type, url: s.url }))
        }
    }

    async updateMySettings(userId: string, dto: UpdateMySettingsDto) {
        if (dto.email !== undefined) {
            const exists = await this.prisma.user.findFirst({
                where: { email: dto.email, NOT: { id: userId } },
                select: { id: true }
            })
            if (exists) throw new BadRequestException("Email already in use")
        }

        const data: any = {}

        if (dto.email !== undefined) data.email = dto.email
        if (dto.username !== undefined) data.username = dto.username
        if (dto.about !== undefined) data.about = dto.about
        if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl
        if (dto.coverUrl !== undefined) data.coverUrl = dto.coverUrl

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                socials: dto.socials
                    ? {
                          deleteMany: { userId },
                          create: dto.socials.map((s) => ({
                              type: s.type,
                              url: s.url
                          }))
                      }
                    : undefined
            },
            select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
                coverUrl: true,
                about: true,
                socials: {
                    select: { type: true, url: true },
                    orderBy: { type: "asc" }
                }
            }
        })

        return {
            id: updated.id,
            email: updated.email,
            username: updated.username || "",
            about: updated.about || "",
            avatarUrl: updated.avatarUrl,
            coverUrl: updated.coverUrl,
            socials: updated.socials.map((s) => ({ type: s.type, url: s.url }))
        }
    }
}
