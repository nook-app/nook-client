export interface ZerionTokenChart {
  links: Links;
  data: Data;
}

export interface Data {
  type: string;
  id: string;
  attributes: Attributes;
}

export interface Attributes {
  begin_at: Date;
  end_at: Date;
  stats: Stats;
  points: Array<number[]>;
}

export interface Stats {
  first: number;
  min: number;
  avg: number;
  max: number;
  last: number;
}

export interface Links {
  self: string;
}
