import { http } from "@/shared/api/http";

export type SportItem = {
    id: string;
    slug: string;
    name: string;
};

export async function fetchSports() {
    return http<SportItem[]>("/sports");
}