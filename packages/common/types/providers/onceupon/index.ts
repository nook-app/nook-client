export interface OnceUponTransactions {
  transactions: OnceUponTransaction[];
  cursor: string;
  partiesEnriched: { [key: string]: PartyEnriched[] };
}

export interface OnceUponTransaction {
  _id: string;
  blockHash: string;
  blockNumber: number;
  from: string;
  gas: number;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  hash: string;
  input: string;
  nonce: number;
  to: string;
  transactionIndex: number;
  value: string;
  type: number;
  accessList?: string[];
  chainId: number;
  v: V;
  r: string;
  s: string;
  yParity?: V;
  receipt: Receipt;
  decoded: DatumDecoded | null;
  pseudoTransactions: string[];
  assetTransfers: AssetTransfer[];
  delegateCalls: DelegateCall[];
  errors: string[];
  parties: string[];
  sigHash: string;
  internalSigHashes: InternalSigHash[];
  timestamp: number;
  baseFeePerGas: number;
  transactionFee: string;
  context: DatumContext;
  netAssetTransfers: NetAssetTransfers;
  contractsCreated: string[];
  assetsEnriched: { [key: string]: AssetsEnriched };
}

interface AssetTransfer {
  from: string;
  to: string;
  type: AssetTransferType;
  value?: string;
  contract?: string;
  tokenId?: string;
}

enum AssetTransferType {
  Erc1155 = "erc1155",
  Erc721 = "erc721",
  Eth = "eth",
  Erc20 = "erc20",
}

interface AssetsEnriched {
  contract?: string;
  tokenId?: string;
  type: AssetTransferType;
  imageUrl?: string;
  value?: string;
}

interface DatumContext {
  variables: Variables;
  summaries: Summaries;
}

interface Summaries {
  category: Category;
  en: En;
}

enum Category {
  Nft = "NFT",
  Protocol1 = "PROTOCOL_1",
}

interface En {
  title: Title;
  default: string;
}

enum Title {
  Highlight = "Highlight",
  NFTMint = "NFT Mint",
  Zora = "Zora",
}

interface Variables {
  [key: string]:
    | ContextActionVariables
    | EthVariables
    | DegenVariables
    | AddressVariables
    | Erc1155Variables
    | Erc721Variables
    | MultipleERC721sVariables
    | Erc20Variables
    | NumberVariables
    | ChainIDVariables
    | TransactionVariables
    | LinkVariables
    | StringVariables;
}

export interface ContextActionVariables {
  type: "contextAction";
  value: ContextAction;
}

export interface EthVariables {
  type: "eth";
  value: string;
}

export interface DegenVariables {
  type: "degen";
  value: string;
}

export interface AddressVariables {
  type: "address";
  value: string;
}

export interface Erc1155Variables {
  type: "erc1155";
  token: string;
  tokenId: string;
  value: string;
}

export interface Erc721Variables {
  type: "erc721";
  token: string;
  tokenId: string;
}

export interface MultipleERC721sVariables {
  type: "multipleERC721s";
  token: string;
}

export interface Erc20Variables {
  type: "erc20";
  contract: string;
  token: string;
  value: string;
}

export interface NumberVariables {
  type: "number";
  value: string;
  unit: string;
  emphasis: boolean;
}

export interface ChainIDVariables {
  type: "chainID";
  value: string;
}

export interface TransactionVariables {
  type: "transaction";
  value: string;
}

export interface LinkVariables {
  type: "link";
  link: string;
  value: string;
  truncate: boolean;
  emphasis: boolean;
}

export interface StringVariables {
  type: string;
  value: string;
  emphasis: boolean;
}
interface DatumDecoded {
  signature: string;
  signature_with_arg_names: string;
  name: string;
  decoded: DecodedElement[];
}

interface DecodedElement {
  internalType: InternalTypeEnum;
  name: Name;
  type: InternalTypeEnum;
  decoded: string;
}

enum InternalTypeEnum {
  Address = "address",
  Uint256 = "uint256",
  Uint48 = "uint48",
}

enum Name {
  Arg1 = "arg1",
  Arg2 = "arg2",
  Arg3 = "arg3",
}

interface DelegateCall {
  action: Action;
  blockHash: string;
  blockNumber: number;
  result: Result;
  subtraces: number;
  traceAddress: number[];
  transactionHash: string;
  transactionPosition: number;
  type: DelegateCallType;
}

interface Action {
  callType: CallType;
  from: string;
  gas: string;
  input: string;
  to: string;
  value: string;
}

enum CallType {
  Delegatecall = "delegatecall",
}

interface Result {
  gasUsed: string;
  output: string;
}

enum DelegateCallType {
  Call = "call",
}

interface InternalSigHash {
  from: string;
  to: string;
  sigHash: string;
}

interface NetAssetTransfers {
  [key: string]: {
    received: {
      contract: string;
      tokenId: string;
      type: AssetTransferType;
      value?: string;
    }[];
    sent: {
      contract: string;
      tokenId: string;
      type: AssetTransferType;
      value?: string;
    }[];
  };
}

interface Receipt {
  blockHash: string;
  blockNumber: number;
  contractAddress: null;
  cumulativeGasUsed: number;
  effectiveGasPrice: number;
  from: string;
  gasUsed: number;
  l1Fee: string;
  l1GasPrice: string;
  l1GasUsed: string;
  logsBloom: string;
  status: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: ReceiptType;
}

enum ReceiptType {
  The0X0 = "0x0",
  The0X2 = "0x2",
}

enum V {
  The0X0 = "0x0",
  The0X1 = "0x1",
  The0X422D = "0x422d",
}

export enum ContextAction {
  BOUGHT = "BOUGHT",
  BRIDGED = "BRIDGED",
  DEPLOYED = "DEPLOYED",
  MINTED = "MINTED",
  SWAPPED = "SWAPPED",
  SENT = "SENT",
  RECEIVED = "RECEIVED",
  COMMITTED_TO = "COMMITTED_TO", // Not yet used in this repo
  RECEIVED_AIRDROP = "RECEIVED_AIRDROP",
  GAVE_ACCESS = "GAVE_ACCESS",
  REVOKED_ACCESS = "REVOKED_ACCESS",
  INTERACTED_WITH = "INTERACTED_WITH", // Not yet used in this repo
  CALLED = "CALLED", // Not yet used in this repo
  SENT_MESSAGE = "SENT_MESSAGE",
  CANCELED_A_PENDING_TRANSACTION = "CANCELED_A_PENDING_TRANSACTION",
}

export interface PartyEnriched {
  chainId: number;
  label: Label;
  isContract: boolean;
  imgUrl: string;
  decimals: number;
  symbol: string;
  ensNew: Bns;
  bns: Bns;
  farcaster: Farcaster;
  tokenStandard?: TokenStandard;
}

export interface Bns {
  handle: null | string;
  avatar: null | string;
}

export interface Farcaster {
  handle: null | string;
  avatar: null | string;
  fid: number | null;
}

export interface Label {
  public: string;
}

export enum TokenStandard {
  Erc1155 = "erc1155",
  Erc20 = "erc20",
  Erc721 = "erc721",
}
