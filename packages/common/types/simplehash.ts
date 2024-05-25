const SIMPLEHASH_CHAINS: { id: string; crosschainId?: string }[] = [
  { id: "ethereum", crosschainId: "eip155:1" },
  //   { id: "solana", crosschainId: "solana:101" },
  //   { id: "bitcoin" },
  //   { id: "utxo" },
  //   { id: "polygon", crosschainId: "eip155:137" },
  //   { id: "tezos" },
  //   { id: "arbitrum", crosschainId: "eip155:42161" },
  //   { id: "arbitrum-nova", crosschainId: "eip155:42170" },
  //   { id: "avalanche", crosschainId: "eip155:43114" },
  { id: "base", crosschainId: "eip155:8453" },
  //   { id: "blast", crosschainId: "eip155:81457" },
  //   { id: "bsc", crosschainId: "eip155:56" },
  //   { id: "celo", crosschainId: "eip155:42220" },
  { id: "degen", crosschainId: "eip155:666666666" },
  //   { id: "fantom", crosschainId: "eip155:250" },
  //   { id: "flow" },
  //   { id: "gnosis", crosschainId: "eip155:100" },
  //   { id: "godwoken", crosschainId: "eip155:71402" },
  //   { id: "linea", crosschainId: "eip155:59144" },
  //   { id: "loot", crosschainId: "eip155:5151706" },
  //   { id: "manta", crosschainId: "eip155:169" },
  //   { id: "moonbeam", crosschainId: "eip155:1284" },
  { id: "optimism", crosschainId: "eip155:10" },
  //   { id: "palm", crosschainId: "eip155:11297108109" },
  //   { id: "polygon-zkevm", crosschainId: "eip155:1442" },
  //   { id: "proof-of-play", crosschainId: "eip155:70700" },
  //   { id: "rari", crosschainId: "eip155:1380012617" },
  //   { id: "scroll", crosschainId: "eip155:534352" },
  //   { id: "xai", crosschainId: "eip155:660279" },
  //   { id: "zksync-era", crosschainId: "eip155:324" },
  { id: "zora", crosschainId: "eip155:7777777" },
];

export enum SimpleHashChain {
  Arbitrum = "arbitrum",
  Bsc = "bsc",
  Ethereum = "ethereum",
  Gnosis = "gnosis",
  Optimism = "optimism",
  Polygon = "polygon",
  Zora = "zora",
  Base = "base",
  Avalanche = "avalanche",
  Blast = "blast",
}

export enum SimpleHashMarketplaceId {
  Blur = "blur",
  LooksRare = "looksrare",
  OpenSea = "opensea",
  X2Y2 = "x2y2",
  MagicEden = "magiceden",
  CryptoPunks = "cryptopunks",
}

type SimpleHashPaymentTokenId = `ethereum.${string}`;

export type SimpleHashTrait = {
  trait_type: string;
  value: string | number;
  display_type: string | null;
};

type SimpleHashRarity = {
  rank: number | null;
  score: number | null;
  unique_attributes: number | null;
};

type SimpleHashPaymentToken = {
  payment_token_id: SimpleHashPaymentTokenId;
  name: string | null;
  symbol: string | null;
  address: string | null;
  decimals: number;
};

export type SimpleHashListing = {
  id: string;
  permalink: string;
  bundle_item_number: number | null;
  listing_timestamp: string;
  expiration_timestamp: string;
  seller_address: string;
  auction_type: string | null;
  quantity: number;
  quantity_remaining: number;
  price: number;
  marketplace_id: SimpleHashMarketplaceId;
  collection_id: string | null;
  nft_id: string;
  payment_token: SimpleHashPaymentToken | null;
};

export type SimpleHashFloorPrice = {
  marketplace_id: SimpleHashMarketplaceId;
  value: number;
  payment_token: SimpleHashPaymentToken;
};

export type SimpleHashMarketplace = {
  marketplace_id: SimpleHashMarketplaceId;
  marketplace_name: string;
  marketplace_collection_id: string;
  nft_url: string;
  collection_url: string;
  verified: boolean | null;
};

export type SimpleHashCollection = {
  collection_id: string;
  name: string;
  description: string;
  image_url: string;
  image_properties: ImageProperties;
  banner_image_url: string;
  category: string;
  is_nsfw: boolean;
  external_url: null;
  twitter_username: string;
  discord_url: null;
  instagram_username: null;
  medium_username: null;
  telegram_url: null;
  marketplace_pages: MarketplacePage[];
  metaplex_mint: null;
  metaplex_candy_machine: null;
  metaplex_first_verified_creator: null;
  floor_prices: string[];
  top_bids: string[];
  distinct_owner_count: number;
  distinct_nft_count: number;
  total_quantity: number;
  chains: string[];
  top_contracts: string[];
  collection_royalties: CollectionRoyalty[];
};

export type SimpleHashNFT = {
  nft_id: string;
  chain: SimpleHashChain;
  contract_address: string;
  token_id: string | null;
  name: string | null;
  description: string | null;
  previews: {
    image_small_url: string | null;
    image_medium_url: string | null;
    image_large_url: string | null;
    image_opengraph_url: string | null;
    blurhash: string | null;
    predominant_color: string | null;
  };
  image_url: string | null;
  image_properties: {
    width: number | null;
    height: number | null;
    size: number | null;
    mime_type: string | null;
  } | null;
  video_url: string | null;
  video_properties: {
    width: number | null;
    height: number | null;
    duration: number | null;
    video_coding: string | null;
    audio_coding: string | null;
    size: number | string;
    mime_type: string | null;
  } | null;
  audio_url: string | null;
  audio_properties: {
    duration: number | null;
    audio_coding: string | null;
    size: number | string;
    mime_type: string | null;
  } | null;
  model_url: string | null;
  model_properties: {
    size: number | null;
    mime_type: string | null;
  } | null;
  background_color: string | null;
  external_url: string | null;
  created_date: string | null;
  status: string;
  token_count: number | null;
  owner_count: number | null;
  owners: SimpleHashNftOwner[];
  last_sale: {
    from_address: string | null;
    to_address: string | null;
    quantity: number | null;
    timestamp: string;
    transaction: string;
    marketplace_id: SimpleHashMarketplaceId;
    marketplace_name: string;
    is_bundle_sale: boolean;
    payment_token: SimpleHashPaymentToken | null;
    unit_price: number | null;
    total_price: number | null;
  } | null;
  first_created: {
    minted_to: string | null;
    quantity: number | null;
    timestamp: string | null;
    block_number: number | null;
    transaction: string | null;
    transaction_initiator: string | null;
  } | null;
  contract: {
    type: string;
    name: string | null;
    symbol: string | null;
    deployed_by: string | null;
    deployed_via: string | null;
  };
  collection: SimpleHashCollection;
  rarity: SimpleHashRarity;
  extra_metadata: {
    image_original_url: string | null;
    animation_original_url: string | null;
    attributes: SimpleHashTrait[] | null | undefined;
  };
  queried_wallet_balances: {
    address: string;
    quantity: number;
    first_acquired_date: string;
    last_acquired_date: string;
  };
};

export type ValidatedSimpleHashNFT = Omit<
  SimpleHashNFT,
  "name" | "collection" | "contract_address" | "token_id"
> & {
  name: string;
  collection: Omit<SimpleHashCollection, "name"> & { name: string };
  contract_address: string;
  token_id: string;
};

export type SimpleHashNFTsResponse = {
  next_cursor?: string;
  next?: string;
  previous?: string;
  nfts: SimpleHashNFT[];
};

export type SimpleHashNftOwner = {
  owner_address: string;
  quantity: number;
  first_acquired_date: string;
  last_acquired_date: string;
};

export interface SimplehashNftCollection {
  collection_id: string;
  distinct_nfts_owned: number;
  distinct_nfts_owned_string: string;
  total_copies_owned: number;
  total_copies_owned_string: string;
  last_acquired_date: Date;
  nft_ids: string[];
  collection_details: SimpleHashCollection;
}

export interface CollectionRoyalty {
  source: string;
  total_creator_fee_basis_points: number;
  recipients: Recipient[];
}

export interface Recipient {
  address: string;
  percentage: number;
  basis_points: number;
}

export interface ImageProperties {
  width: number;
  height: number;
  mime_type: string;
}

export interface MarketplacePage {
  marketplace_id: string;
  marketplace_name: string;
  marketplace_collection_id: string;
  collection_url: string;
  verified: boolean | null;
}

export interface SimpleHashNFTEvent {
  nft_id: string;
  chain: string;
  contract_address: string;
  token_id: string;
  collection_id: string;
  event_type: string;
  from_address: string;
  to_address: string;
  quantity: number;
  quantity_string: string;
  timestamp: Date;
  block_number: number;
  block_hash: string;
  transaction: string;
  transaction_initiator: string;
  log_index: number;
  batch_transfer_index: number;
  sale_details: SaleDetails;
  nft_details: SimpleHashNFT;
}

export interface SaleDetails {
  marketplace_id: string;
  marketplace_name: string;
  is_bundle_sale: boolean;
  payment_token: PaymentToken;
  unit_price: number;
  total_price: number;
  unit_price_usd_cents: number;
}

export interface PaymentToken {
  payment_token_id: string;
  name: string;
  symbol: string;
  address: null;
  decimals: number;
}
