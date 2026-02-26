export type Role = "USER" | "CAPPER" | "ADMIN";

const ROLE_WEIGHT: Record<Role, number> = {
    USER: 1,
    CAPPER: 2,
    ADMIN: 3,
};

export function hasRole(current: Role, required: Role) {
    return ROLE_WEIGHT[current] >= ROLE_WEIGHT[required];
}
