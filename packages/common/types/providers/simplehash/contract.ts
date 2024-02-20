export interface NFTCollectionByContractResponse {
  next_cursor?: null;
  next?: null;
  previous?: null;
  collections?: NFTCollection[] | null;
}
export interface NFTCollection {
  collection_id: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url?: null;
  category?: null;
  is_nsfw: boolean;
  external_url?: null;
  twitter_username?: null;
  discord_url?: null;
  instagram_username?: null;
  medium_username?: null;
  telegram_url?: null;
  marketplace_pages?: MarketplacePagesEntity[] | null;
  metaplex_mint?: null;
  metaplex_candy_machine?: null;
  metaplex_first_verified_creator?: null;
  floor_prices?: null[] | null;
  top_bids?: null[] | null;
  distinct_owner_count: number;
  distinct_nft_count: number;
  total_quantity: number;
  chains?: string[] | null;
  top_contracts?: string[] | null;
  collection_royalties?: CollectionRoyaltiesEntity[] | null;
  top_contract_details?: TopContractDetailsEntity[] | null;
}
export interface MarketplacePagesEntity {
  marketplace_id: string;
  marketplace_name: string;
  marketplace_collection_id: string;
  collection_url: string;
  verified: boolean;
}
export interface CollectionRoyaltiesEntity {
  source: string;
  total_creator_fee_basis_points: number;
  recipients?: null[] | null;
}
export interface TopContractDetailsEntity {
  chain: string;
  contract_address: string;
  name: string;
  type: string;
  symbol: string;
  distinct_nft_count: number;
  deployed_by: string;
  deployed_via_contract: string;
  deployment_date: string;
  owned_by: string;
  has_multiple_collections: boolean;
}
