import {
  GetSignerResponse,
  PendingSignerResponse,
  Session,
  ValidateSignerResponse,
} from "@nook/common/types";
import { makeRequest } from "../utils";

export const loginUser = async (
  token: string,
): Promise<Session & { signer: GetSignerResponse }> => {
  return await makeRequest("/v1/user/login", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getSigner = async (): Promise<GetSignerResponse> => {
  return await makeRequest("/signer");
};

export const validateSigner = async (
  token: string,
): Promise<ValidateSignerResponse> => {
  return await makeRequest(`/signer/validate?token=${token}`);
};

export const validateSignerByPublicKey = async (
  publicKey: string,
): Promise<ValidateSignerResponse> => {
  return await makeRequest(`/signer/validate?publicKey=${publicKey}`);
};

export const getPendingSigner = async (
  address: string,
): Promise<PendingSignerResponse> => {
  return await makeRequest(`/signer/${address}`);
};
