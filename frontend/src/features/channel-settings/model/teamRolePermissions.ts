export type TeamPermissionKey = "publishFree" | "publishPaid" | "paidModuleAccess" | "directMessagesAccess";

export type TeamPermissionSet = Record<TeamPermissionKey, boolean>;

export type TeamRoleKey = "editor" | "moderator" | "member";

export type TeamRolePermissions = Record<TeamRoleKey, TeamPermissionSet>;

export const DEFAULT_TEAM_ROLE_PERMISSIONS: TeamRolePermissions = {
    editor: {
        publishFree: true,
        publishPaid: false,
        paidModuleAccess: false,
        directMessagesAccess: false,
    },
    moderator: {
        publishFree: true,
        publishPaid: true,
        paidModuleAccess: false,
        directMessagesAccess: false,
    },
    member: {
        publishFree: false,
        publishPaid: false,
        paidModuleAccess: true,
        directMessagesAccess: true,
    },
};

function normalizeSet(value: unknown, fallback: TeamPermissionSet): TeamPermissionSet {
    const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

    return {
        publishFree: typeof source.publishFree === "boolean" ? source.publishFree : fallback.publishFree,
        publishPaid: typeof source.publishPaid === "boolean" ? source.publishPaid : fallback.publishPaid,
        paidModuleAccess: typeof source.paidModuleAccess === "boolean" ? source.paidModuleAccess : fallback.paidModuleAccess,
        directMessagesAccess: typeof source.directMessagesAccess === "boolean" ? source.directMessagesAccess : fallback.directMessagesAccess,
    };
}

export function normalizeTeamRolePermissions(value: unknown): TeamRolePermissions {
    const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

    return {
        editor: normalizeSet(source.editor, DEFAULT_TEAM_ROLE_PERMISSIONS.editor),
        moderator: normalizeSet(source.moderator, DEFAULT_TEAM_ROLE_PERMISSIONS.moderator),
        member: normalizeSet(source.member, DEFAULT_TEAM_ROLE_PERMISSIONS.member),
    };
}
