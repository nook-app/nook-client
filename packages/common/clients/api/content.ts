import {
  FarcasterCastResponse,
  GetContentsResponse,
  UrlContentResponse,
} from "../../types";
import { FarcasterFeedRequest } from "../../types/feed";
import { BaseAPIClient } from "./base";

export class ContentAPIClient extends BaseAPIClient {
  API_ENDPOINT = process.env.CONTENT_API_ENDPOINT;

  async getContent(uri: string): Promise<UrlContentResponse | undefined> {
    const response = await this.makeRequest("/content", {
      method: "POST",
      body: JSON.stringify({ uri }),
    });

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getContents(
    uris: string[],
    cached?: boolean,
  ): Promise<GetContentsResponse> {
    const response = await this.makeRequest("/content", {
      method: "POST",
      body: JSON.stringify({ uris, cached }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async addContentReferences(cast: FarcasterCastResponse) {
    const response = await this.makeRequest("/content/references", {
      method: "POST",
      body: JSON.stringify(cast),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async removeContentReferences(cast: FarcasterCastResponse) {
    const response = await this.makeRequest("/content/references", {
      method: "DELETE",
      body: JSON.stringify(cast),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getContentFeed(
    body: FarcasterFeedRequest,
  ): Promise<{ data: string[]; nextCursor: string | undefined }> {
    const response = await this.makeRequest("/feed/content", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }
}
