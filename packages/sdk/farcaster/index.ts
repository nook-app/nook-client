import { FarcasterCastAddData, FidHash } from "@flink/common/types";

export const getCastByURI = async (uri: string) => {
  const casts = await getCasts({ uris: [uri] });
  if (!casts) {
    return;
  }
  return casts[0];
};

export const getCastByID = async (fidHash: FidHash) => {
  const casts = await getCasts({ fidHashes: [fidHash] });
  if (!casts) {
    return;
  }
  return casts[0];
};

export const getCasts = async ({
  uris,
  fidHashes,
}: { uris?: string[]; fidHashes?: FidHash[] }): Promise<
  FarcasterCastAddData[] | undefined
> => {
  const response = await fetch(`${process.env.FARCASTER_SERVICE_URL}/casts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids: fidHashes,
      uris,
    }),
  });

  if (!response.ok) {
    if (response.status !== 404) {
      console.log(
        `[farcaster] [get-cast] failed with ${response.status} for ${uris}`,
      );
    }
    return undefined;
  }

  const { casts } = await response.json();

  return casts;
};
