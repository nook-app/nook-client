export type { ZerionToken } from "./token";
export type { ZerionTokenChart } from "./token-chart";

export interface ZerionTokenHoldings {
  links: TokenHoldingsLinks;
  data: TokenHolding[];
}

interface TokenHolding {
  type: DatumType;
  id: string;
  attributes: Attributes;
  relationships: Relationships;
}

interface Attributes {
  parent: null;
  protocol: null;
  name: Name;
  position_type: PositionType;
  quantity: Quantity;
  value: number | null;
  price: number;
  changes: Changes | null;
  fungible_info: FungibleInfo;
  flags: AttributesFlags;
  updated_at: Date;
  updated_at_block: number;
}

interface Changes {
  absolute_1d: number;
  percent_1d: number;
}

interface AttributesFlags {
  displayable: boolean;
  is_trash: boolean;
}

interface FungibleInfo {
  name: string;
  symbol: string;
  icon: Icon | null;
  flags: FungibleInfoFlags;
  implementations: Implementation[];
}

interface FungibleInfoFlags {
  verified: boolean;
}

interface Icon {
  url: string;
}

interface Implementation {
  chain_id: string;
  address: null | string;
  decimals: number;
}

enum Name {
  Asset = "Asset",
}

enum PositionType {
  Wallet = "wallet",
}

interface Quantity {
  int: string;
  decimals: number;
  float: number;
  numeric: string;
}

interface Relationships {
  chain: Chain;
  fungible: Chain;
}

interface Chain {
  links: ChainLinks;
  data: Data;
}

interface Data {
  type: DataType;
  id: string;
}

enum DataType {
  Chains = "chains",
  Fungibles = "fungibles",
}

interface ChainLinks {
  related: string;
}

enum DatumType {
  Positions = "positions",
}

interface TokenHoldingsLinks {
  self: string;
}
