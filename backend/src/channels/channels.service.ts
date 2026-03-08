import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { CreateChannelDto } from './dto/create-channel.dto'
import { UpdateChannelSettingsDto } from './dto/update-channel-settings.dto'
import {
  DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS,
  mapChannelTeamRolePermissionsFromRows,
  normalizeChannelTeamRolePermissions
} from './channel-team-permissions'

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  private hasMixedCyrillicAndLatin(value: string): boolean {
    return /[A-Za-z]/.test(value) && /[А-Яа-яЁё]/.test(value)
  }

  private ensureSingleLanguageChannelName(name: string) {
    if (this.hasMixedCyrillicAndLatin(name)) {
      throw new BadRequestException('Channel name must use one language')
    }
  }

  private async ensureUniqueChannelName(name: string, excludedChannelId?: string) {
    const excludedCondition = excludedChannelId
      ? Prisma.sql`AND id <> ${excludedChannelId}`
      : Prisma.empty

    const existing = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id
      FROM "Channel"
      WHERE lower(name) = lower(${name})
      ${excludedCondition}
      LIMIT 1
    `)

    if (existing.length > 0) {
      throw new ConflictException('Name is already taken')
    }
  }

  private throwMappedUniqueConstraint(error: Prisma.PrismaClientKnownRequestError): never {
    const target = Array.isArray(error.meta?.target)
      ? error.meta?.target.join(',').toLowerCase()
      : String(error.meta?.target ?? '').toLowerCase()

    if (target.includes('slug') || target.includes('channel_slug_key')) {
      throw new ConflictException('Slug is already taken')
    }

    if (
      target.includes('name') ||
      target.includes('channel_name_nocase_key') ||
      target.includes('channel.name')
    ) {
      throw new ConflictException('Name is already taken')
    }

    throw error
  }

  private normalizeSlug(input: string): string {
    const s = input
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')

    return s.length ? s : 'channel'
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    const base = this.normalizeSlug(baseSlug)
    let candidate = base

    for (let i = 0; i < 50; i += 1) {
      const exists = await this.prisma.channel.findUnique({ where: { slug: candidate } })
      if (!exists) return candidate
      candidate = `${base}-${i + 2}`
    }

    const suffix = Math.random().toString(36).slice(2, 8)
    return `${base}-${suffix}`
  }

  private async requireChannelBySlug(slug: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { slug },
      select: { id: true, deletedAt: true }
    })

    if (!channel || channel.deletedAt) throw new NotFoundException('Channel not found')
    return channel
  }

  private async requireEditorRole(channelId: string, userId: string) {
    const member = await this.prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
        status: 'active'
      },
      select: { role: true }
    })

    if (!member) throw new ForbiddenException('Not a member')

    if (member.role !== 'owner' && member.role !== 'editor' && member.role !== 'moderator') {
      throw new ForbiddenException('No permission')
    }

    return member
  }

  private mapChannelWithPermissions<T extends {
    teamRolePermissions?: Array<{
      roleGroup: 'analyst' | 'manager'
      publishFree: boolean
      publishPaid: boolean
      paidModuleAccess: boolean
      directMessagesAccess: boolean
    }>
  }>(channel: T) {
    if (!channel.teamRolePermissions) {
      return channel
    }

    return {
      ...channel,
      teamRolePermissions: mapChannelTeamRolePermissionsFromRows(channel.teamRolePermissions)
    }
  }

  async create(userId: string, dto: CreateChannelDto) {
    const channelName = dto.name.trim()
    this.ensureSingleLanguageChannelName(channelName)
    await this.ensureUniqueChannelName(channelName)

    const slugSource = dto.slug?.trim().length ? dto.slug : dto.name
    const slug = await this.ensureUniqueSlug(slugSource)

    const startingBankroll =
      typeof dto.startingBankroll === 'number' ? dto.startingBankroll : 1000

    const sportIds = Array.isArray(dto.sportIds) ? dto.sportIds.filter(Boolean) : []

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const channel = await tx.channel.create({
          data: {
            slug,
            name: channelName,
            description: dto.description ?? null,
            avatarUrl: dto.avatarUrl ?? null,
            coverUrl: dto.coverUrl ?? null,
            visibility: (dto.visibility as any) ?? 'public',
            joinPolicy: (dto.joinPolicy as any) ?? 'open',
            ownerId: userId,
            startingBankroll,
            currentBankroll: startingBankroll,
            bankrollCurrency: dto.bankrollCurrency ?? null,
            membersCount: 1
          }
        })

        await tx.channelMember.create({
          data: {
            userId,
            channelId: channel.id,
            role: 'owner',
            status: 'active'
          }
        })

        await tx.channelTeamRolePermission.createMany({
          data: [
            {
              channelId: channel.id,
              roleGroup: 'analyst',
              publishFree: DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.analyst.publishFree,
              publishPaid: DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.analyst.publishPaid,
              paidModuleAccess: DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.analyst.paidModuleAccess,
              directMessagesAccess: DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.analyst.directMessagesAccess
            },
            {
              channelId: channel.id,
              roleGroup: 'manager',
              publishFree: DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.manager.publishFree,
              publishPaid: DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.manager.publishPaid,
              paidModuleAccess: DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.manager.paidModuleAccess,
              directMessagesAccess: DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.manager.directMessagesAccess
            }
          ]
        })

        await tx.channelStats.upsert({
          where: { channelId: channel.id },
          update: {},
          create: {
            channelId: channel.id,
            totalPredictions: 0,
            wins: 0,
            losses: 0,
            voids: 0,
            totalStake: 0,
            totalProfit: 0,
            roi: 0,
            winRate: 0
          }
        })

        if (sportIds.length) {
          await tx.channelSport.createMany({
            data: sportIds.map((sportId) => ({
              channelId: channel.id,
              sportId
            }))
          })
        }

        return channel
      })

      return this.prisma.channel.findUnique({
        where: { id: result.id },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              username: true,
              handle: true,
              avatarUrl: true
            }
          },
          sports: {
            include: { sport: true }
          },
          stats: true
        }
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        this.throwMappedUniqueConstraint(e)
      }
      throw e
    }
  }

  async listPublic(takeRaw?: number, skipRaw?: number) {
    const take = Math.max(
      1,
      Math.min(Number.isFinite(takeRaw as number) ? (takeRaw as number) : 20, 50)
    )
    const skip = Math.max(0, Number.isFinite(skipRaw as number) ? (skipRaw as number) : 0)

    return this.prisma.channel.findMany({
      where: {
        deletedAt: null,
        visibility: 'public'
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            handle: true,
            avatarUrl: true
          }
        },
        sports: {
          include: { sport: true }
        },
        stats: true
      }
    })
  }

  async getBySlug(slug: string, userId?: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            handle: true,
            avatarUrl: true
          }
        },
        sports: {
          include: { sport: true }
        },
        stats: true,
        teamRolePermissions: {
          select: {
            roleGroup: true,
            publishFree: true,
            publishPaid: true,
            paidModuleAccess: true,
            directMessagesAccess: true
          }
        }
      }
    })

    if (!channel || channel.deletedAt) {
      throw new NotFoundException('Channel not found')
    }

    let membership: { role: string; status: string } | null = null

    if (userId) {
      membership = await this.prisma.channelMember.findFirst({
        where: {
          channelId: channel.id,
          userId
        },
        select: {
          role: true,
          status: true
        }
      })
    }

    if (channel.visibility === 'private' && membership?.status !== 'active') {
      throw new NotFoundException('Channel not found')
    }

    const isMemberActive = membership?.status === 'active'

    const mappedChannel = this.mapChannelWithPermissions(channel)

    return {
      ...mappedChannel,
      isMember: isMemberActive,
      myRole: isMemberActive ? membership?.role ?? null : null
    }
  }

  async subscribe(slug: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { slug }
    })

    if (!channel || channel.deletedAt) {
      throw new NotFoundException('Channel not found')
    }

    if (channel.visibility === 'private') {
      throw new ForbiddenException('Private channel')
    }

    if (channel.ownerId === userId) {
      throw new ConflictException('Owner cannot subscribe to own channel')
    }

    const existing = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId: channel.id
        }
      }
    })

    if (existing?.status === 'active') {
      return { success: true }
    }

    if (existing?.status === 'banned') {
      throw new ForbiddenException('Banned user cannot subscribe')
    }

    await this.prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.channelMember.update({
          where: {
            userId_channelId: {
              userId,
              channelId: channel.id
            }
          },
          data: {
            status: 'active',
            role: existing.role === 'owner' ? 'member' : existing.role,
            leftAt: null
          }
        })
      } else {
        await tx.channelMember.create({
          data: {
            userId,
            channelId: channel.id,
            role: 'member',
            status: 'active',
            leftAt: null
          }
        })
      }

      const activeMembersCount = await tx.channelMember.count({
        where: {
          channelId: channel.id,
          status: 'active'
        }
      })

      await tx.channel.update({
        where: { id: channel.id },
        data: {
          membersCount: activeMembersCount
        }
      })
    })

    return { success: true }
  }

  async unsubscribe(slug: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { slug }
    })

    if (!channel || channel.deletedAt) {
      throw new NotFoundException('Channel not found')
    }

    const membership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId: channel.id
        }
      }
    })

    if (!membership || membership.status === 'left') {
      return { success: true }
    }

    if (membership.role === 'owner') {
      throw new ConflictException('Owner cannot unsubscribe from own channel')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.channelMember.update({
        where: {
          userId_channelId: {
            userId,
            channelId: channel.id
          }
        },
        data: {
          status: 'left',
          leftAt: new Date()
        }
      })

      const activeMembersCount = await tx.channelMember.count({
        where: {
          channelId: channel.id,
          status: 'active'
        }
      })

      await tx.channel.update({
        where: { id: channel.id },
        data: {
          membersCount: activeMembersCount
        }
      })
    })

    return { success: true }
  }


  async remove(slug: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { slug },
      select: { id: true, deletedAt: true }
    })

    if (!channel || channel.deletedAt) {
      throw new NotFoundException('Channel not found')
    }

    const membership = await this.prisma.channelMember.findFirst({
      where: {
        channelId: channel.id,
        userId,
        status: 'active'
      },
      select: { role: true }
    })

    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException('No permission to delete channel')
    }

    await this.prisma.channel.delete({
      where: { id: channel.id }
    })

    return { success: true }
  }

  async updateSettings(slug: string, userId: string, dto: UpdateChannelSettingsDto) {
    const channel = await this.requireChannelBySlug(slug)
    await this.requireEditorRole(channel.id, userId)

    let channelName: string | undefined
    if (dto.name !== undefined) {
      channelName = dto.name.trim()
      this.ensureSingleLanguageChannelName(channelName)
      await this.ensureUniqueChannelName(channelName, channel.id)
    }

    const normalizedPermissions =
      dto.teamRolePermissions === undefined
        ? undefined
        : normalizeChannelTeamRolePermissions(dto.teamRolePermissions)

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.channel.update({
          where: { id: channel.id },
          data: {
            name: channelName ?? undefined,
            slug: dto.slug ?? undefined,
            description: dto.description ?? undefined,
            avatarUrl: dto.avatarUrl ?? undefined,
            coverUrl: dto.coverUrl ?? undefined,
            visibility: dto.visibility ?? undefined,
            joinPolicy: dto.joinPolicy ?? undefined,
            telegramUrl: dto.telegramUrl === '' ? null : dto.telegramUrl ?? undefined,
            twitterUrl: dto.twitterUrl === '' ? null : dto.twitterUrl ?? undefined,
            instagramUrl: dto.instagramUrl === '' ? null : dto.instagramUrl ?? undefined,
            vkUrl: dto.vkUrl === '' ? null : dto.vkUrl ?? undefined,
            websiteUrl: dto.websiteUrl === '' ? null : dto.websiteUrl ?? undefined,
            telegramEnabled: dto.telegramEnabled ?? undefined,
            vkEnabled: dto.vkEnabled ?? undefined,
            websiteEnabled: dto.websiteEnabled ?? undefined,
            startingBankroll: dto.startingBankroll ?? undefined,
            bankrollCurrency: dto.bankrollCurrency ?? undefined
          }
        })

        if (normalizedPermissions) {
          await tx.channelTeamRolePermission.upsert({
            where: {
              channelId_roleGroup: {
                channelId: channel.id,
                roleGroup: 'analyst'
              }
            },
            update: normalizedPermissions.analyst,
            create: {
              channelId: channel.id,
              roleGroup: 'analyst',
              ...normalizedPermissions.analyst
            }
          })

          await tx.channelTeamRolePermission.upsert({
            where: {
              channelId_roleGroup: {
                channelId: channel.id,
                roleGroup: 'manager'
              }
            },
            update: normalizedPermissions.manager,
            create: {
              channelId: channel.id,
              roleGroup: 'manager',
              ...normalizedPermissions.manager
            }
          })
        }
      })

      const updatedChannel = await this.prisma.channel.findUnique({
        where: { id: channel.id },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              handle: true,
              avatarUrl: true
            }
          },
          stats: true,
          sports: {
            include: { sport: true }
          },
          teamRolePermissions: {
            select: {
              roleGroup: true,
              publishFree: true,
              publishPaid: true,
              paidModuleAccess: true,
              directMessagesAccess: true
            }
          }
        }
      })

      if (!updatedChannel) {
        throw new NotFoundException('Channel not found')
      }

      return this.mapChannelWithPermissions(updatedChannel)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        this.throwMappedUniqueConstraint(e)
      }
      throw e
    }
  }
}
