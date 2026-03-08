export type ChannelTeamPermissionKey =
  | 'publishFree'
  | 'publishPaid'
  | 'paidModuleAccess'
  | 'directMessagesAccess'

export type ChannelTeamPermissionSet = Record<ChannelTeamPermissionKey, boolean>

export type ChannelTeamRolePermissions = {
  editor: ChannelTeamPermissionSet
  moderator: ChannelTeamPermissionSet
  member: ChannelTeamPermissionSet
}

export const DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS: ChannelTeamRolePermissions = {
  editor: {
    publishFree: true,
    publishPaid: false,
    paidModuleAccess: false,
    directMessagesAccess: false
  },
  moderator: {
    publishFree: true,
    publishPaid: true,
    paidModuleAccess: false,
    directMessagesAccess: false
  },
  member: {
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
    editor: normalizePermissionSet(source.editor, DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.editor),
    moderator: normalizePermissionSet(source.moderator, DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.moderator),
    member: normalizePermissionSet(source.member, DEFAULT_CHANNEL_TEAM_ROLE_PERMISSIONS.member)
  }
}
