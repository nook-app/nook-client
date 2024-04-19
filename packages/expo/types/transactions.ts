import { FarcasterUser } from './user'

export type TransactionResponse = {
  chainId: number
  blockNumber: number
  blockHash: string
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  parties: string[]
  netAssetTransfers: {
    [key: string]: {
      sent: TransactionAssetTransfer[]
      received: TransactionAssetTransfer[]
    }
  }
  context: TransactionContext
  enrichedParties: Record<string, any>
}

export type TransactionContext = {
  summaries: {
    category: string
    en: {
      title: string
      default: string
      variables: Record<string, any>
    }
  }
  variables: Record<string, any>
}

export type TransactionAssetTransfer = {
  asset: string
  id: string
  tokenId: string
  value: string
  type: string
  imageUrl?: string
}

export enum AssetType {
  ETH = 'eth',
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  ERC1155 = 'erc1155',
}

export type ContextStringType = {
  type: 'string'
  value: string
  indexed?: boolean
  emphasis?: boolean
  truncate?: boolean
  unit?: string
}

export type ContextHexType = {
  type: 'address' | 'transaction' | 'farcasterID' | 'crosschain'
  value: string
  indexed?: boolean
  emphasis?: boolean
}

export type ContextCodeType = {
  type: 'code'
  value: string
}

export type ContextActionType = {
  type: 'contextAction'
  value: ContextAction
  indexed?: boolean
  emphasis?: boolean
}

export type ContextERC20Type = {
  type: AssetType.ERC20
  token: string
  value: string
  indexed?: boolean
  emphasis?: boolean
}

export type ContextERC721Type = {
  type: AssetType.ERC721
  tokenId: string
  token: string
  indexed?: boolean
  emphasis?: boolean
}

export type ContextMultipleERC721Type = {
  type: AssetType.ERC721
  token: string
  indexed?: boolean
  emphasis?: boolean
}

export type ContextERC1155Type = {
  type: AssetType.ERC1155
  tokenId: string
  token: string
  value: string
  indexed?: boolean
  emphasis?: boolean
}

export type ContextETHType = {
  type: AssetType.ETH
  value: string
  indexed?: boolean
  emphasis?: boolean
  unit: string
}

export type ContextChainIDType = {
  type: 'chainID'
  value: number
  indexed?: boolean
  emphasis?: boolean
}

export type ContextNumberType = {
  type: 'number'
  value: number
  indexed?: boolean
  emphasis?: boolean
  unit?: string // nonce is an example where there is no unit
}

export type ContextLinkType = {
  type: 'link'
  value: string
  truncate?: boolean
  link: string
}

export type ContextSummaryVariableType =
  | ContextStringType
  | ContextHexType
  | ContextCodeType
  | ContextActionType
  | ContextERC20Type
  | ContextERC721Type
  | ContextMultipleERC721Type
  | ContextERC1155Type
  | ContextETHType
  | ContextChainIDType
  | ContextNumberType
  | ContextLinkType

export type ContextVariable = {
  [key: string]: ContextSummaryVariableType
}

export type ContextSummaryType = {
  category?:
    | 'MULTICHAIN'
    | 'FUNGIBLE_TOKEN'
    | 'NFT'
    | 'IDENTITY'
    | 'CORE'
    | 'OTHER'
    | 'DEV'
    | 'GOVERNANCE'
    | 'MULTISIG'
    | 'ACCOUNT_ABSTRACTION'
    | 'PROTOCOL_1'
    | 'PROTOCOL_2'
    | 'PROTOCOL_3'
    | 'PROTOCOL_4'
    | 'PROTOCOL_5'
    | 'UNKNOWN'
  en: {
    title: string
    default: string
    variables?: ContextVariable
    long?: string
  }
}

export type HeuristicContextAction =
  | 'BOUGHT'
  | 'BRIDGED'
  | 'DEPLOYED'
  | 'MINTED'
  | 'SWAPPED'
  | 'SENT'
  | 'RECEIVED'
  | 'COMMITTED_TO'
  | 'RECEIVED_AIRDROP'
  | 'GAVE_ACCESS'
  | 'REVOKED_ACCESS'
  | 'INTERACTED_WITH'
  | 'SENT_MESSAGE'
  | 'CANCELED_A_PENDING_TRANSACTION'

export type ContextAction = HeuristicContextAction | ProtocolContextAction | 'CALLED'

export type WETHContextAction = 'WRAPPED' | 'UNWRAPPED'

export type ENSContextAction = 'REGISTERED' | 'RENEWED' | 'SET_REVERSE_ENS_TO'

export type CryptoPunksContextAction =
  | 'MINTED_PUNK'
  | 'LISTED_PUNK'
  | 'WITHDREW_BID_FOR'
  | 'BID_ON_PUNK'
  | 'WITHDREW_FROM_CONTRACT'
  | 'BOUGHT_PUNK'
  | 'TRANSFERRED_PUNK'
  | 'UNLISTED_PUNK'

export type LeeroyContextAction =
  | 'TIPPED'
  | 'UPDATED_USER_DETAILS'
  | 'REPLIED_TO'
  | 'REPOSTED'
  | 'REGISTERED_USERNAME'
  | 'FOLLOWED'
  | 'UNFOLLOWED'
  | 'POSTED'

export type FrenpetContextAction =
  | 'SET_PET_NAME'
  | 'BOUGHT_ACCESSORY'
  | 'ATTACKED'
  | 'REDEEMED'
  | 'COMMITTED_TO_ATTACKING'
  | 'TOO_SLOW_TO_ATTACK'
  | 'WHEEL_REVEALED'
  | 'WHEEL_COMMITTED'
  | 'KILLED'
  | 'MINTED'
  | 'REDEEMED'
  | 'SOLD_ITEM'
  | 'JOINED_DICE_GAME'
  | 'DICE_GAME_SETTLED'

export type FarcasterContextAction =
  | 'REGISTERED_FARCASTER_ID'
  | 'CHANGED_RECOVERY_ADDRESS'
  | 'TRANSFERRED_FARCASTER_ID'
  | 'RENTED'
  | 'REMOVED_A_KEY'
  | 'ADDED_A_KEY'

export type EASContextAction = 'ATTESTED' | 'REVOKED' | 'TIMESTAMPED' | 'REGISTERED'

export type FriendTechContextAction =
  | 'FAILED_TO_BUY_KEYS'
  | 'BOUGHT_KEYS'
  | 'SOLD_KEYS'
  | 'SIGNED_UP'

export type NounsAuctionHouseAction = 'BID' | 'SETTLED'

export type NounsGovernorAction =
  | 'CREATED_PROPOSAL'
  | 'VOTED_FOR'
  | 'VOTED_AGAINST'
  | 'ABSTAINED'
  | 'QUEUED'
  | 'EXECUTED'
  | 'CANCELED'
  | 'VETOED'

export type UniswapV2RouterAction = 'ADDED_LIQUIDITY'

export type ClaimCampaignsAction = 'CLAIMED'

export type BasepaintAction = 'PAINTED' | 'WITHDREW_REWARDS'

export type DisperseAction = 'TIPPED'

export type ProtocolContextAction =
  | WETHContextAction
  | ENSContextAction
  | CryptoPunksContextAction
  | LeeroyContextAction
  | FrenpetContextAction
  | FarcasterContextAction
  | EASContextAction
  | FriendTechContextAction
  | NounsAuctionHouseAction
  | NounsGovernorAction
  | UniswapV2RouterAction
  | ClaimCampaignsAction
  | BasepaintAction
  | DisperseAction
