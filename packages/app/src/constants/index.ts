import Constants from "expo-constants";
import channels from "./channels.json";

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
