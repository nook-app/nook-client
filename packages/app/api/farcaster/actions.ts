import {
  SubmitCastAddRequest,
  SubmitCastRemoveRequest,
  SubmitFrameActionRequest,
  SubmitFrameActionResponse,
  SubmitLinkAddRequest,
  SubmitLinkRemoveRequest,
  SubmitMessageError,
  SubmitMessageResponse,
  SubmitReactionAddRequest,
  SubmitReactionRemoveRequest,
  SubmitUserDataAddRequest,
} from "@nook/common/types";
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
  const response = await makeRequest("/signer/link-add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  return response;
};

export const submitLinkRemove = async (
  req: SubmitLinkRemoveRequest,
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  const response = await makeRequest("/signer/link-remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  return response;
};

export const submitCastRemove = async (
  req: SubmitCastRemoveRequest,
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  const response = await makeRequest("/signer/cast-remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  return response;
};

export const submitReactionAdd = async (
  req: SubmitReactionAddRequest,
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  const response = await makeRequest("/signer/reaction-add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  return response;
};

export const submitReactionRemove = async (
  req: SubmitReactionRemoveRequest,
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  const response = await makeRequest("/signer/reaction-remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  return response;
};

export const submitUserDataAdd = async (
  req: SubmitUserDataAddRequest,
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  const response = await makeRequest("/signer/user-data-add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  return response;
};

export const submitFrameAction = async (
  req: SubmitFrameActionRequest,
): Promise<SubmitFrameActionResponse | SubmitMessageError> => {
  return await makeRequest("/frames/action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};
