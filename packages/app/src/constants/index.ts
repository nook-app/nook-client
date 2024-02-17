import Constants from "expo-constants";
import channels from "./channels.json";
import { SignInParams } from "@/utils/api";

export const CONFIG =
  Constants.appOwnership === "expo"
    ? {
        dev: true,
        apiBaseUrl: "http://localhost:3000",
        siwfUri: "http://localhost:3000",
        siwfDomain: "localhost:3000",
      }
    : {
        dev: false,
        apiBaseUrl: "https://flink-api.up.railway.app",
        siwfUri: "https://flink-api.up.railway.app",
        siwfDomain: "flink-api.up.railway.app",
      };

export const CHANNELS = channels.reduce(
  (acc, channel) => {
    acc[channel.url] = channel;
    return acc;
  },
  {} as Record<string, (typeof channels)[0]>,
);

export const DEV_SIGN_IN: SignInParams = {
  message:
    "localhost:3000 wants you to sign in with your Ethereum account:\n0x94Bac74eC80C25fd5F19A76F2cd74a46d6618c3A\n\nFarcaster Connect\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 10\nNonce: yRnR3Cv5FjrRQwAfl\nIssued At: 2024-02-02T23:29:10.600Z\nResources:\n- farcaster://fid/262426",
  nonce: "yRnR3Cv5FjrRQwAfl",
  signature:
    "0x7f539bb1a70bcace1bd652529068b441e38298aa57bb2aca0714a7e7f6c48600613a9c86562890cb948de4a56912a54752c496c69eadc5fb80612d4e615458f41b",
};
