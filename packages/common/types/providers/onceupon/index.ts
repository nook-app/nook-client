export interface OnceUponTransactions {
  transactions: OnceUponTransaction[];
  cursor: string;
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
  recipient: MintReferral;
  sender: MintReferral;
  minted: MintReferral;
  token?: Token;
  price?: NumOfEth;
  referrer?: Referrer;
  numOfEth?: NumOfEth;
  mintReferral?: MintReferral;
  multipleERC721s?: MultipleERC721S;
  amount?: Amount;
}

interface Amount {
  type: string;
  value: number;
  unit: string;
}

interface MintReferral {
  type: MintReferralType;
  value: string;
}

enum MintReferralType {
  Address = "address",
  ContextAction = "contextAction",
  Eth = "eth",
}

interface MultipleERC721S {
  type: AssetTransferType;
  token: string;
}

interface NumOfEth {
  type: AssetTransferType;
  value: string;
  unit: Unit;
}

enum Unit {
  Wei = "wei",
}

interface Referrer {
  type: string;
  value: string;
  rawValue: string;
}

interface Token {
  type: AssetTransferType;
  token?: string;
  tokenId: string;
  value?: string;
  contract?: string;
  imageUrl?: string;
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
