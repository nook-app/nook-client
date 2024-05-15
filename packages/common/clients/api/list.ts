import {
  CreateListRequest,
  GetListsRequest,
  List,
  ListItem,
  UpdateListRequest,
} from "../../types";
import { BaseAPIClient } from "./base";

export class ListAPIClient extends BaseAPIClient {
  API_ENDPOINT = process.env.LIST_API_ENDPOINT;

  async getCreatedLists(
    token: string,
    req: GetListsRequest,
  ): Promise<{ data: List[] }> {
    const response = await this.makeRequest("/lists/created", {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getFollowedLists(
    token: string,
    req: GetListsRequest,
  ): Promise<{ data: List[] }> {
    const response = await this.makeRequest("/lists/followed", {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getList(token: string, listId: string): Promise<List> {
    const response = await this.makeRequest(`/lists/${listId}`, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async createList(token: string, list: CreateListRequest): Promise<List> {
    const response = await this.makeRequest("/lists", {
      method: "PUT",
      body: JSON.stringify(list),
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async updateList(
    token: string,
    listId: string,
    list: UpdateListRequest,
  ): Promise<List> {
    const response = await this.makeRequest(`/lists/${listId}`, {
      method: "PATCH",
      body: JSON.stringify(list),
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async removeList(token: string, listId: string): Promise<void> {
    const response = await this.makeRequest(`/lists/${listId}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async addListItem(
    token: string,
    listId: string,
    item: ListItem,
  ): Promise<void> {
    const response = await this.makeRequest(`/lists/${listId}/items`, {
      method: "PUT",
      body: JSON.stringify(item),
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async removeListItem(
    token: string,
    listId: string,
    item: ListItem,
  ): Promise<void> {
    const response = await this.makeRequest(`/lists/${listId}/items`, {
      method: "DELETE",
      body: JSON.stringify(item),
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async followList(token: string, listId: string): Promise<void> {
    const response = await this.makeRequest(`/lists/${listId}/follow`, {
      method: "PUT",
      headers: {
        Authorization: token,
      },
    });
  }

  async unfollowList(token: string, listId: string): Promise<void> {
    const response = await this.makeRequest(`/lists/${listId}/follow`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });
  }
}
