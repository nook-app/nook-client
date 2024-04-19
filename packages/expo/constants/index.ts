export const CONFIG = __DEV__
  ? {
      dev: true,
      apiBaseUrl: "https://nook-api.up.railway.app/v0",
      siwfUri: "https://nook.social",
      siwfDomain: "nook.social",
    }
  : {
      dev: false,
      apiBaseUrl: "https://nook-api.up.railway.app/v0",
      siwfUri: "https://nook.social",
      siwfDomain: "nook.social",
    };
