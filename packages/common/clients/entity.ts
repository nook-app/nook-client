import { EntityResponse, GetEntitiesResponse } from "../types";
import { BaseClient } from "./base";

export class EntityClient extends BaseClient {
  API_ENDPOINT = process.env.ENTITY_API_ENDPOINT;

  async fetchEntity(id: string, viewerFid?: string): Promise<EntityResponse> {
    return await this.makeRequest(`/entities/${id}`, {
      viewerFid,
    });
  }

  async fetchEntityByFid(
    fid: string,
    viewerFid?: string,
  ): Promise<EntityResponse> {
    return await this.makeRequest(`/entities/by-fid/${fid}`, {
      viewerFid,
    });
  }

  async fetchEntitiesByFids(
    fids: string[],
    viewerFid?: string,
  ): Promise<GetEntitiesResponse> {
    return await this.makeRequest("/entities/by-fid", {
      method: "POST",
      body: JSON.stringify({ fids }),
      viewerFid,
    });
  }
}
