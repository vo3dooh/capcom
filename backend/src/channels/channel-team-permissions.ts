import { ChannelMemberRole, ChannelTeamRoleGroup } from '@prisma/client'

export type ChannelTeamPermissionKey =
  | 'publishFree'
  | 'publishPaid'
  | 'paidModuleAccess'
  | 'directMessagesAccess'

export type ChannelTeamPermissionSet = Record<ChannelTeamPermissionKey, boolean>

export type ChannelTeamRoleKey = 'analyst' | 'manager'

export type ChannelTeamRolePermissions = Record<ChannelTeamRoleKey, ChannelTeamPermissionSet>

type ChannelTeamRolePermissionRow = {
  roleGroup: ChannelTeamRoleGroup
  publishFree: boolean
  publishPaid: boolean
  paidModuleAccess: boolean
  directMessagesAccess: boolean
}

export const DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS: ChannelTeamRolePermissions = {
  analyst: {
    publishFree: true,
    publishPaid: true,
    paidModuleAccess: false,
    directMessagesAccess: false
  },
  manager: {
    publishFree: false,
    publishPaid: false,
    paidModuleAccess: true,
    directMessagesAccess: true
  }
}

function normalizePermissionSet(value: unknown, fallback: ChannelTeamPermissionSet): ChannelTeamPermissionSet {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    publishFree: typeof source.publishFree === 'boolean' ? source.publishFree : fallback.publishFree,
    publishPaid: typeof source.publishPaid === 'boolean' ? source.publishPaid : fallback.publishPaid,
    paidModuleAccess:
      typeof source.paidModuleAccess === 'boolean' ? source.paidModuleAccess : fallback.paidModuleAccess,
    directMessagesAccess:
      typeof source.directMessagesAccess === 'boolean'
        ? source.directMessagesAccess
        : fallback.directMessagesAccess
  }
}

export function normalizeChannelTeamRolePermissions(value: unknown): ChannelTeamRolePermissions {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    analyst: normalizePermissionSet(source.analyst, DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.analyst),
    manager: normalizePermissionSet(source.manager, DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.manager)
  }
}

export function mapChannelTeamRolePermissionsFromRows(
  rows: ChannelTeamRolePermissionRow[] | null | undefined
): ChannelTeamRolePermissions {
  if (!rows || rows.length === 0) {
    return DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS
  }

  const analystRow = rows.find((row) => row.roleGroup === 'analyst')
  const managerRow = rows.find((row) => row.roleGroup === 'manager')

  return {
    analyst: analystRow
      ? {
          publishFree: analystRow.publishFree,
          publishPaid: analystRow.publishPaid,
          paidModuleAccess: analystRow.paidModuleAccess,
          directMessagesAccess: analystRow.directMessagesAccess
        }
      : DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.analyst,
    manager: managerRow
      ? {
          publishFree: managerRow.publishFree,
          publishPaid: managerRow.publishPaid,
          paidModuleAccess: managerRow.paidModuleAccess,
          directMessagesAccess: managerRow.directMessagesAccess
        }
      : DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.manager
  }
}

export function canRolePublishFree(
  memberRole: ChannelMemberRole,
  permissions: ChannelTeamRolePermissions
): boolean {
  if (memberRole === 'owner') {
    return true
  }

  if (memberRole === 'moderator' || memberRole === 'editor') {
    return permissions.analyst.publishFree
  }

  if (memberRole === 'member') {
    return permissions.manager.publishFree
  }

  return false
}
