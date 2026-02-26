import { http } from "@/shared/api/http";

export type OddsSportMapped = {
    key: string;
    group: string;
    title: string;
    active: boolean;
    sportId: string | null;
};

export type OddsEvent = {
    id: string;
    sportKey: string;
    sportTitle: string;
    commenceTime: string;
    home: string;
    away: string;
};

export type OddsOutcome = {
    name: string;
    price: number;
    point: number | null;
};

export type OddsMarket = {
    key: string;
    outcomes: OddsOutcome[];
};

export type OddsBookmaker = {
    key: string;
    title: string;
    lastUpdate: string;
    markets: OddsMarket[];
};

export type OddsEventOdds = {
    id: string;
    sportKey: string;
    sportTitle: string;
    commenceTime: string;
    home: string;
    away: string;
    bookmakers: OddsBookmaker[];
};

export async function fetchOddsSportsMapped() {
    return http<OddsSportMapped[]>("/odds/sports-mapped");
}

export async function fetchOddsEvents(params: {
    sportKey: string;
    regions?: string;
    markets?: string;
    bookmakers?: string;
    oddsFormat?: "decimal" | "american";
    dateFormat?: "iso";
}) {
    const sp = new URLSearchParams();
    sp.set("sportKey", params.sportKey);
    sp.set("regions", params.regions ?? "eu");
    sp.set("markets", params.markets ?? "h2h");
    sp.set("oddsFormat", params.oddsFormat ?? "decimal");
    sp.set("dateFormat", params.dateFormat ?? "iso");
    if (params.bookmakers) sp.set("bookmakers", params.bookmakers);

    return http<OddsEvent[]>(`/odds/events?${sp.toString()}`);
}

export async function fetchOddsForEvent(params: {
    eventId: string;
    sportKey: string;
    regions?: string;
    markets?: string;
    bookmakers?: string;
    oddsFormat?: "decimal" | "american";
    dateFormat?: "iso";
}) {
    const sp = new URLSearchParams();
    sp.set("sportKey", params.sportKey);
    sp.set("regions", params.regions ?? "eu");
    sp.set("markets", params.markets ?? "h2h,spreads,totals");
    sp.set("oddsFormat", params.oddsFormat ?? "decimal");
    sp.set("dateFormat", params.dateFormat ?? "iso");
    if (params.bookmakers) sp.set("bookmakers", params.bookmakers);

    return http<OddsEventOdds>(`/odds/events/${params.eventId}/odds?${sp.toString()}`);
}