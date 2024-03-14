export class BaseAPIClient {
  API_ENDPOINT?: string | undefined = undefined;

  async makeRequest(
    path: string,
    options: RequestInit & { viewerFid?: string } = {},
  ) {
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
      ...(options.viewerFid ? { "X-Viewer-Fid": options.viewerFid } : {}),
    };

    console.log(`Making request to ${this.API_ENDPOINT}${path}`);

    const response = await fetch(`${this.API_ENDPOINT}${path}`, {
      ...options,
      headers,
    });

    return response;
  }
}
