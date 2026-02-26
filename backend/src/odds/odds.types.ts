export type OddsSport = {
  key: string
  group: string
  title: string
  description?: string | null
  active: boolean
  has_outrights?: boolean
}

export type OddsOutcome = {
  name: string
  price: number
  point?: number
}

export type OddsMarket = {
  key: string
  outcomes: OddsOutcome[]
}

export type OddsBookmaker = {
  key: string
  title: string
  last_update: string
  markets: OddsMarket[]
}

export type OddsEventOdds = {
  id: string
  sport_key: string
  sport_title?: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: OddsBookmaker[]
}

export type UiSport = {
  key: string
  group: string
  title: string
  active: boolean
}

export type UiMappedSport = UiSport & {
  sportId: string | null
}

export type UiEvent = {
  id: string
  sportKey: string
  sportTitle: string
  commenceTime: string
  home: string
  away: string
}

export type UiOutcome = {
  name: string
  price: number
  point: number | null
}

export type UiMarket = {
  key: string
  outcomes: UiOutcome[]
}

export type UiBookmaker = {
  key: string
  title: string
  lastUpdate: string
  markets: UiMarket[]
}

export type UiEventOdds = {
  id: string
  sportKey: string
  sportTitle: string
  commenceTime: string
  home: string
  away: string
  bookmakers: UiBookmaker[]
}