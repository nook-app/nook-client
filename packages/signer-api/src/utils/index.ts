import { privateKeyToAccount } from "viem/accounts";
import * as ed from "./ed25519";

type WarpcastSignerResponse = {
  result: {
    signedKeyRequest: {
      token: string;
      deeplinkUrl: string;
      key: string;
      requestFid: number;
      state: string;
      isSponsored: boolean;
      userFid: number;
    };
  };
};

const WARPCAST_API_URL = "https://api.warpcast.com/v2";

export const generateKeyPair = async () => {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);

  return {
    publicKey: `0x${Buffer.from(publicKey).toString("hex")}`,
    privateKey: `0x${Buffer.from(privateKey).toString("hex")}`,
  } as {
    publicKey: `0x${string}`;
    privateKey: `0x${string}`;
  };
};

export const getWarpcastDeeplink = async (key: `0x${string}`) => {
  const { signature, deadline, requestFid, requestAddress } =
    await signMessage(key);
  const response = await fetch(`${WARPCAST_API_URL}/signed-key-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      signature,
      deadline,
      requestFid,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const {
    result: { signedKeyRequest: { token, deeplinkUrl, state } },
  }: WarpcastSignerResponse = await response.json();

  return {
    signature,
    requestFid,
    requestAddress,
    deadline,
    token,
    deeplinkUrl,
    state,
  };
};

export const validateSignerRegistration = async (token: string) => {
  const response = await fetch(
    `${WARPCAST_API_URL}/signed-key-request?token=${token}`,
  );

  if (!response.ok) {
    return {
      state: "pending",
    };
  }

  const {
    result: { signedKeyRequest: { state, userFid } },
  }: WarpcastSignerResponse = await response.json();

  return {
    state,
    userFid,
  };
};

export const signMessage = async (key: `0x${string}`) => {
  const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    name: "Farcaster SignedKeyRequestValidator",
    version: "1",
    chainId: 10,
    verifyingContract:
      "0x00000000fc700472606ed4fa22623acf62c60553" as `0x${string}`,
  };

  const SIGNED_KEY_REQUEST_TYPE = [
    { name: "requestFid", type: "uint256" },
    { name: "key", type: "bytes" },
    { name: "deadline", type: "uint256" },
  ];

  const requestFid = process.env.NOOK_FID as string;
  const account = privateKeyToAccount(
    process.env.NOOK_PRIVATE_KEY as `0x${string}`,
  );

  const deadline = Math.floor(Date.now() / 1000) + 86400;
  const signature = await account.signTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: "SignedKeyRequest",
    message: {
      key,
      requestFid: BigInt(requestFid),
      deadline: BigInt(deadline),
    },
  });

  return {
    signature,
    requestFid,
    deadline,
    requestAddress: account.address,
  };
};
