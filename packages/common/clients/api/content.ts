import {
  FarcasterCastResponse,
  GetContentsResponse,
  UrlContentResponse,
} from "../../types";
import { BaseClient } from "./base";

export class ContentClient extends BaseClient {
  API_ENDPOINT = process.env.CONTENT_API_ENDPOINT;

  async getContent(uri: string): Promise<UrlContentResponse> {
    return await this.makeRequest("/content", {
      method: "POST",
      body: JSON.stringify({ uri }),
    });
  }

  async getContents(uris: string[]): Promise<GetContentsResponse> {
    return await this.makeRequest("/contents", {
      method: "POST",
      body: JSON.stringify({ uris }),
    });
  }

  async addContentReferences(cast: FarcasterCastResponse) {
    return await this.makeRequest("/content/references", {
      method: "POST",
      body: JSON.stringify(cast),
    });
  }

  async removeContentReferences(cast: FarcasterCastResponse) {
    return await this.makeRequest("/content/references", {
      method: "DELETE",
      body: JSON.stringify(cast),
    });
  }
}
