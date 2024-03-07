import {
  FarcasterCastResponse,
  GetContentsResponse,
  UrlContentResponse,
} from "../../types";
import { BaseAPIClient } from "./base";

export class ContentAPIClient extends BaseAPIClient {
  API_ENDPOINT = process.env.CONTENT_API_ENDPOINT;

  async getContent(uri: string): Promise<UrlContentResponse> {
    return await this.makeRequest("/content", {
      method: "POST",
      body: JSON.stringify({ uri }),
    });
  }

  async getContents(uris: string[]): Promise<GetContentsResponse> {
    return await this.makeRequest("/content", {
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
