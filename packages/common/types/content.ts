export enum ContentType {
  WEBPAGE = "webpage",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  TEXT = "text",
  JSON = "json",
  OTHER = "other",
  FARCASTER_CAST = "farcaster_cast",
}

export type ContentMetadata = {
  source: string;
  data: object;
};

// this needs to be in mongo
// i.e. collection group
// special url-speicfic rich metadata embeds
// etc
export type Content = {
  id: string;
  type: ContentType;
  mimeType?: string;
  length?: number;
  source: string;
  metadata: ContentMetadata;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentReference = {
  id: string;
  contentId: string;
  metadataSource: string;
  metadata: object;
  createdAt: Date;
  updatedAt: Date;
};
