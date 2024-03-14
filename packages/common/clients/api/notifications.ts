import { BaseAPIClient } from "./base";

export class NotificationsAPIClient extends BaseAPIClient {
  API_ENDPOINT = process.env.NOTIFICATIONS_API_ENDPOINT;

  async getNotificationUser(
    token: string,
  ): Promise<{ fid: string; disabled: boolean } | undefined> {
    const response = await this.makeRequest("/user", {
      headers: {
        Authorization: token,
      },
    });

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  }

  async deleteNotificationUser(token: string): Promise<void> {
    const response = await this.makeRequest("/user", {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  }

  async createNotificationUser(
    token: string,
    pushToken: string,
  ): Promise<void> {
    const response = await this.makeRequest("/user", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({ token: pushToken }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  }
}
