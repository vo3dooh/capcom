export type AuthMode = "login" | "register";

export type AuthResponse = {
    accessToken: string;
};

export type ApiError = {
    message: string;
};