import { FarcasterCastData, FidHash } from "@flink/common/types";

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
  FarcasterCastData[] | undefined
> => {
  if (!uris?.length && !fidHashes?.length) {
    return [];
  }

  const response = await fetch(`${process.env.FARCASTER_SERVICE_URL}/casts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids: Array.from(new Set(fidHashes)),
      uris: Array.from(new Set(uris)),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed getting cast with ${response.status} for ${fidHashes} and ${uris}`,
    );
  }

  const { casts } = await response.json();

  return casts;
};

export const getUsers = async (fids: string[]) => {
  if (!fids?.length) return [];

  const response = await fetch(`${process.env.FARCASTER_SERVICE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fids,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed getting cast with ${response.status} for ${fids}`);
  }

  return await response.json();
};
