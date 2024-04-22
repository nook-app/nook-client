import {
  SubmitCastAddRequest,
  SubmitLinkAddRequest,
  SubmitLinkRemoveRequest,
  SubmitMessageError,
  SubmitMessageResponse,
} from "../../types";
import { makeRequest } from "../utils";

export const submitCastAdds = async (
  req: SubmitCastAddRequest[],
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  if (req.length === 1) {
    return await submitCastAdd(req[0]);
  }

  return await makeRequest("/signer/cast-add/thread", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: req }),
  });
};

export const submitCastAdd = async (
  req: SubmitCastAddRequest,
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  return await makeRequest("/signer/cast-add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};

export const submitLinkAdd = async (
  req: SubmitLinkAddRequest,
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  return await makeRequest("/signer/link-add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};

export const submitLinkRemove = async (
  req: SubmitLinkRemoveRequest,
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  return await makeRequest("/signer/link-remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};
