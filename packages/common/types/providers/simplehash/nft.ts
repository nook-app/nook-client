export interface NFT {
  nft_id: string;
  chain: string;
  contract_address: string;
  token_id: string;
  name: string;
  description?: null;
  previews: Previews;
  image_url: string;
  image_properties: ImageProperties;
  video_url?: null;
  video_properties?: null;
  audio_url?: null;
  audio_properties?: null;
  model_url?: null;
  model_properties?: null;
  other_url?: null;
  other_properties?: null;
  background_color?: null;
  external_url?: null;
  created_date: string;
  status: string;
  token_count: number;
  owner_count: number;
  owners?: OwnersEntity[] | null;
  contract: Contract;
  collection: Collection;
  last_sale: LastSale;
  first_created: FirstCreated;
  rarity: Rarity;
  royalty?: CollectionRoyaltiesEntityOrRoyaltyEntity[] | null;
  extra_metadata: ExtraMetadata;
}
export interface Previews {
  image_small_url: string;
  image_medium_url: string;
  image_large_url: string;
  image_opengraph_url: string;
  blurhash: string;
  predominant_color: string;
}
export interface ImageProperties {
  width: number;
  height: number;
  size: number;
  mime_type: string;
}
export interface OwnersEntity {
  owner_address: string;
  quantity: number;
  quantity_string: string;
  first_acquired_date: string;
  last_acquired_date: string;
}
export interface Contract {
  type: string;
  name: string;
  symbol: string;
  deployed_by: string;
  deployed_via_contract?: null;
  owned_by: string;
  has_multiple_collections: boolean;
}
export interface Collection {
  collection_id: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  category: string;
  is_nsfw: boolean;
  external_url: string;
  twitter_username: string;
  discord_url: string;
  instagram_username?: null;
  medium_username?: null;
  telegram_url?: null;
  marketplace_pages?: MarketplacePagesEntity[] | null;
  metaplex_mint?: null;
  metaplex_candy_machine?: null;
  metaplex_first_verified_creator?: null;
  floor_prices?: FloorPricesEntityOrTopBidsEntity[] | null;
  top_bids?: FloorPricesEntityOrTopBidsEntity[] | null;
  distinct_owner_count: number;
  distinct_nft_count: number;
  total_quantity: number;
  chains?: string[] | null;
  top_contracts?: string[] | null;
  collection_royalties?: CollectionRoyaltiesEntityOrRoyaltyEntity[] | null;
}
export interface MarketplacePagesEntity {
  marketplace_id: string;
  marketplace_name: string;
  marketplace_collection_id: string;
  nft_url: string;
  collection_url: string;
  verified: boolean;
}
export interface FloorPricesEntityOrTopBidsEntity {
  marketplace_id: string;
  marketplace_name: string;
  value: number;
  payment_token: PaymentToken;
  value_usd_cents: number;
}
export interface PaymentToken {
  payment_token_id: string;
  name: string;
  symbol: string;
  address?: null;
  decimals: number;
}
export interface CollectionRoyaltiesEntityOrRoyaltyEntity {
  source: string;
  total_creator_fee_basis_points: number;
  recipients?: RecipientsEntity[] | null;
}
export interface RecipientsEntity {
  address: string;
  percentage: number;
  basis_points: number;
}
export interface LastSale {
  from_address: string;
  to_address: string;
  quantity: number;
  quantity_string: string;
  timestamp: string;
  transaction: string;
  marketplace_id: string;
  marketplace_name: string;
  is_bundle_sale: boolean;
  payment_token: PaymentToken;
  unit_price: number;
  total_price: number;
  unit_price_usd_cents: number;
}
export interface FirstCreated {
  minted_to: string;
  quantity: number;
  quantity_string: string;
  timestamp: string;
  block_number: number;
  transaction: string;
  transaction_initiator: string;
}
export interface Rarity {
  rank: number;
  score: number;
  unique_attributes: number;
}
export interface ExtraMetadata {
  attributes?: AttributesEntity[] | null;
  image_original_url: string;
  animation_original_url?: null;
  metadata_original_url: string;
}
export interface AttributesEntity {
  trait_type: string;
  value: string;
  display_type?: null;
}
