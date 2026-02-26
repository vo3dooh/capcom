import type { Permission } from "./permissions.types";

export type SystemRole = "user" | "moderator" | "admin";

export const rolePermissionsMap: Record<SystemRole, Permission[]> = {
    user: [
        "channels.create"
    ],
    moderator: [
        "channels.create",
        "channels.update.any",
        "channels.delete.any"
    ],
    admin: [
        "channels.create",
        "channels.update.any",
        "channels.delete.any",
        "admin.panel",
        "admin.users.read",
        "admin.users.updateRoles"
    ]
};
