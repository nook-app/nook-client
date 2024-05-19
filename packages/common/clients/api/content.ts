import {
  FarcasterContentReference,
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

  async getReferences(
    references: FarcasterContentReference[],
    skipFetch?: boolean,
  ): Promise<GetContentsResponse> {
    const response = await this.makeRequest("/content/references", {
      method: "POST",
      body: JSON.stringify({ references, skipFetch }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async deleteReferences(references: FarcasterContentReference[]) {
    const response = await this.makeRequest("/content/references", {
      method: "DELETE",
      body: JSON.stringify({ references }),
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
