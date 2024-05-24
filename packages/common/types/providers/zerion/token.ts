export interface ZerionToken {
  links: TokenLinks;
  data: TokenData;
}

export interface TokenData {
  type: string;
  id: string;
  attributes: Attributes;
  relationships: Relationships;
}

export interface Attributes {
  name: string;
  symbol: string;
  description: string;
  icon: Icon;
  flags: Flags;
  external_links: {
    name: string;
    type: string;
    url: string;
  }[];
  implementations: Implementation[];
  market_data: MarketData;
}

export interface Flags {
  verified: boolean;
}

export interface Icon {
  url: string;
}

export interface Implementation {
  chain_id: string;
  address: null;
  decimals: number;
}

export interface MarketData {
  total_supply: number;
  circulating_supply: number;
  market_cap: number;
  fully_diluted_valuation: number;
  price: number;
  changes: Changes;
}

export interface Changes {
  percent_1d: number;
  percent_30d: number;
  percent_90d: number;
  percent_365d: number;
}

export interface Relationships {
  chart_day: Chart;
  chart_hour: Chart;
  chart_max: Chart;
  chart_month: Chart;
  chart_week: Chart;
  chart_year: Chart;
}

export interface Chart {
  links: ChartDayLinks;
  data: ChartDayData;
}

export interface ChartDayData {
  type: string;
  id: string;
}

export interface ChartDayLinks {
  related: string;
}

export interface TokenLinks {
  self: string;
}
