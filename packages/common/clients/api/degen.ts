import {
  AllTipAllowancesResponse,
  IndividualTipAllowance,
  TipAllowanceResponse,
} from "../../types/degen";
import { BaseAPIClient } from "./base";

export class DegenAPIClient extends BaseAPIClient {
  API_ENDPOINT = process.env.DEGEN_API_ENDPOINT;

  async getAllAllowances(): Promise<AllTipAllowancesResponse> {
    const response = await this.makeRequest("/allowances");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getIndividualAllowance(
    fid: string,
  ): Promise<IndividualTipAllowance | null> {
    const response = await this.makeRequest(`/allowances/${fid}`);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const individualAllowance: TipAllowanceResponse =
      response.json() as unknown as TipAllowanceResponse;
    if (individualAllowance.length === 0) {
      return null;
    }
    return individualAllowance[0];
  }
}
