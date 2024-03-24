import {
  FarcasterCastResponse,
  FarcasterMediaArgs,
  GetContentsResponse,
  ShelfDataRequest,
  ShelfDataResponse,
  UrlContentResponse,
} from "../../types";
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

  async getContents(uris: string[]): Promise<GetContentsResponse> {
    const response = await this.makeRequest("/content", {
      method: "POST",
      body: JSON.stringify({ uris }),
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

  async getNewMedia(
    body: ShelfDataRequest<FarcasterMediaArgs>,
  ): Promise<ShelfDataResponse<string>> {
    const response = await this.makeRequest("/feed/media/new", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getNewFrames(
    body: ShelfDataRequest<FarcasterMediaArgs>,
  ): Promise<ShelfDataResponse<string>> {
    const response = await this.makeRequest("/feed/frames/new", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getNewEmbeds(
    body: ShelfDataRequest<FarcasterMediaArgs>,
  ): Promise<ShelfDataResponse<string>> {
    const response = await this.makeRequest("/feed/embeds/new", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }
}
