export interface ZerionTransactions {
  links: PokedexLinks;
  data: ZerionTransaction[];
}

export interface ZerionTransaction {
  type: DatumType;
  id: string;
  attributes: Attributes;
  relationships: Relationships;
}

export interface Attributes {
  operation_type: OperationType;
  hash: string;
  mined_at_block: number;
  mined_at: Date;
  sent_from: string;
  sent_to: string;
  status: Status;
  nonce: number;
  fee: Fee;
  transfers: Transfer[];
  approvals: Approval[];
  application_metadata: ApplicationMetadata;
  flags: AttributesFlags;
}

export interface ApplicationMetadata {
  contract_address: string;
  method?: Method;
  name?: string;
  icon?: Icon;
}

export interface Icon {
  url: string;
}

export interface Method {
  id: string;
  name: string;
}

export interface Approval {
  fungible_info: FungibleInfo;
  quantity: Quantity;
  sender: Sender;
}

export interface FungibleInfo {
  name: string;
  symbol: string;
  icon: Icon | null;
  flags: FungibleInfoFlags;
  implementations: Implementation[];
}

export interface FungibleInfoFlags {
  verified: boolean;
}

export interface Implementation {
  chain_id: ChainID;
  address: string;
  decimals: number;
}

export enum ChainID {
  Arbitrum = "arbitrum",
  AstarZkevm = "astar-zkevm",
  Aurora = "aurora",
  Avalanche = "avalanche",
  Base = "base",
  BinanceSmartChain = "binance-smart-chain",
  Blast = "blast",
  Celo = "celo",
  Degen = "degen",
  Ethereum = "ethereum",
  Linea = "linea",
  MantaPacific = "manta-pacific",
  MetisAndromeda = "metis-andromeda",
  Mode = "mode",
  Optimism = "optimism",
  Polygon = "polygon",
  PolygonZkevm = "polygon-zkevm",
  Scroll = "scroll",
  Solana = "solana",
  Xdai = "xdai",
  ZksyncEra = "zksync-era",
  Zora = "zora",
}

export interface Quantity {
  int: string;
  decimals: number;
  float: number;
  numeric: string;
}

export enum Sender {
  The0X00000000009726632680Fb29D3F7A9734E3010E2 = "0x00000000009726632680fb29d3f7a9734e3010e2",
  The0X333601A803Cac32B7D17A38D32C9728A93B422F4 = "0x333601a803cac32b7d17a38d32c9728a93b422f4",
  The0X4015B418937234E5C9A3031E3D3Dde2Ec1126C53 = "0x4015b418937234e5c9a3031e3d3dde2ec1126c53",
  The0Xa61550E9Ddd2797E16489Db09343162Be98D9483 = "0xa61550e9ddd2797e16489db09343162be98d9483",
  The0Xd663B056A69282D300C1901F15Aaca3A7993A783 = "0xd663b056a69282d300c1901f15aaca3a7993a783",
  The0Xf3608D6C834Deb6D03463082Aa9417F78A4E611F = "0xf3608d6c834deb6d03463082aa9417f78a4e611f",
  The0Xf70Da97812Cb96Acdf810712Aa562Db8Dfa3Dbef = "0xf70da97812cb96acdf810712aa562db8dfa3dbef",
}

export interface Fee {
  fungible_info: FungibleInfo;
  quantity: Quantity;
  price: number | null;
  value: number | null;
}

export interface AttributesFlags {
  is_trash: boolean;
}

export enum OperationType {
  Approve = "approve",
  Execute = "execute",
  Mint = "mint",
  Receive = "receive",
  Send = "send",
  Trade = "trade",
}

export enum Status {
  Confirmed = "confirmed",
}

export interface Transfer {
  fungible_info?: FungibleInfo;
  direction: Direction;
  quantity: Quantity;
  value: number | null;
  price: number | null;
  sender: string;
  recipient: Sender;
  nft_info?: NftInfo;
}

export enum Direction {
  In = "in",
  Out = "out",
}

export interface NftInfo {
  contract_address: string;
  token_id: string;
  name: string;
  interface: Interface;
  content: Content;
  flags: NftInfoFlags;
}

export interface Content {
  preview: Icon;
  detail: Icon;
}

export interface NftInfoFlags {
  is_spam: boolean;
}

export enum Interface {
  Erc1155 = "ERC1155",
  Erc721 = "ERC721",
}

export interface Relationships {
  chain: Chain;
  dapp: Dapp;
}

export interface Chain {
  links: ChainLinks;
  data: Data;
}

export interface Data {
  type: DataType;
  id: string;
}

export enum DataType {
  Chains = "chains",
  Dapps = "dapps",
}

export interface ChainLinks {
  related: string;
}

export interface Dapp {
  data: Data;
}

export enum DatumType {
  Transactions = "transactions",
}

export interface PokedexLinks {
  self: string;
  next: string;
}
