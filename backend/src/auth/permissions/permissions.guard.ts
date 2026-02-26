import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "./permissions.decorator.js";
import { rolePermissionsMap, type SystemRole } from "./role-permissions.map.js";
import type { Permission } from "./permissions.types.js";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions =
            this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as { role?: SystemRole } | undefined;

        if (!user?.role) {
            throw new ForbiddenException("No role attached");
        }

        const userPermissions = rolePermissionsMap[user.role] || [];

        const hasAllPermissions = requiredPermissions.every((p) => userPermissions.includes(p));

        if (!hasAllPermissions) {
            throw new ForbiddenException("Insufficient permissions");
        }

        return true;
    }
}
