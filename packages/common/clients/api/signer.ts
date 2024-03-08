import {
  GetSignerResponse,
  SubmitCastAddRequest,
  SubmitCastRemoveRequest,
  SubmitFrameActionRequest,
  SubmitLinkAddRequest,
  SubmitLinkRemoveRequest,
  SubmitMessageError,
  SubmitMessageResponse,
  SubmitReactionAddRequest,
  SubmitReactionRemoveRequest,
  ValidateSignerResponse,
} from "../../types";
import { BaseAPIClient } from "./base";

export class SignerAPIClient extends BaseAPIClient {
  API_ENDPOINT = process.env.SIGNER_API_ENDPOINT;

  async getSigner(token: string): Promise<GetSignerResponse> {
    return await this.makeRequest("/signer", {
      headers: {
        Authorization: token,
      },
    });
  }

  async validateSigner(
    token: string,
    signerToken: string,
  ): Promise<ValidateSignerResponse> {
    return await this.makeRequest(`/signer/validate?token=${signerToken}`, {
      headers: {
        Authorization: token,
      },
    });
  }

  async submitCastAdd(
    token: string,
    data: SubmitCastAddRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    return await this.makeRequest("/signer/cast-add", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify(data),
    });
  }

  async submitCastRemove(
    token: string,
    data: SubmitCastRemoveRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    return await this.makeRequest("/signer/cast-remove", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify(data),
    });
  }

  async submitReactionAdd(
    token: string,
    data: SubmitReactionAddRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    return await this.makeRequest("/signer/reaction-add", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify(data),
    });
  }

  async submitReactionRemove(
    token: string,
    data: SubmitReactionRemoveRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    return await this.makeRequest("/signer/reaction-remove", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify(data),
    });
  }

  async submitLinkAdd(
    token: string,
    data: SubmitLinkAddRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    return await this.makeRequest("/signer/link-add", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify(data),
    });
  }

  async submitLinkRemove(
    token: string,
    data: SubmitLinkRemoveRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    return await this.makeRequest("/signer/link-remove", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify(data),
    });
  }

  async submitFrameAction(
    token: string,
    data: SubmitFrameActionRequest,
  ): Promise<SubmitMessageResponse | SubmitMessageError> {
    return await this.makeRequest("/signer/frame-action", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify(data),
    });
  }
}
