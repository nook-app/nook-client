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

    const response = await fetch(`${this.API_ENDPOINT}${path}`, {
      ...options,
      headers,
    });

    return response;
  }
}
