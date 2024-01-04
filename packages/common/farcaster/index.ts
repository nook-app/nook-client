import { getIdentitiesForFids } from "../identity";
import {
  ContentType,
  FarcasterCastRawData,
  FarcasterPostData,
  FarcasterReplyData,
  Identity,
} from "../types";

type FidHash = {
  fid: string;
  hash: string;
};

export const getFarcasterCastByURI = async (
  uri: string,
): Promise<FarcasterCastRawData | undefined> => {
  const casts = await getFarcasterCasts([uri], null);
  if (!casts) {
    return undefined;
  }
  return casts[0];
};

export const getFarcasterCastByFidHash = async (
  fidHash: FidHash,
): Promise<FarcasterCastRawData | undefined> => {
  const casts = await getFarcasterCasts(null, [fidHash]);
  if (!casts) {
    return undefined;
  }
  return casts[0];
};

export const getFarcasterCastsByURIs = async (
  uris: string[],
): Promise<FarcasterCastRawData[] | undefined> => {
  if (uris.length === 0) return [];
  const casts = await getFarcasterCasts(uris, null);
  if (!casts) {
    return undefined;
  }
  return casts;
};

export const getFarcasterCastsByFidHashes = async (
  fidHashes: FidHash[],
): Promise<FarcasterCastRawData[] | undefined> => {
  if (fidHashes.length === 0) return [];
  const casts = await getFarcasterCasts(null, fidHashes);
  if (!casts) {
    return undefined;
  }
  return casts;
};

export const getFarcasterCasts = async (
  uris: string[],
  fidHashes: FidHash[],
): Promise<FarcasterCastRawData[] | undefined> => {
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

export const toFarcasterURI = (fid: string, hash: string) => {
  return `farcaster://cast/${fid}/${hash}`;
};

export const generateFarcasterPost = async (cast: FarcasterCastRawData) => {
  const { thread, parent, identities } = await getExternalCastData(cast);

  const fidToIdentity = identities.reduce(
    (acc, identity) => {
      acc[identity.socialAccounts[0].platformId] = identity;
      return acc;
    },
    {} as Record<string, Identity>,
  );

  return {
    ...formatCast(cast, fidToIdentity),
    rootParentId: toFarcasterURI(cast.rootParentFid, cast.rootParentHash),
    rootParent: thread ? formatCast(thread, fidToIdentity) : undefined,
  } as FarcasterPostData;
};

export const generateFarcasterReply = async (cast: FarcasterCastRawData) => {
  const { thread, parent, identities } = await getExternalCastData(cast);

  const fidToIdentity = identities.reduce(
    (acc, identity) => {
      acc[identity.socialAccounts[0].platformId] = identity;
      return acc;
    },
    {} as Record<string, Identity>,
  );

  return {
    ...formatCast(cast, fidToIdentity),
    rootParentId: toFarcasterURI(cast.rootParentFid, cast.rootParentHash),
    rootParent: thread ? formatCast(thread, fidToIdentity) : undefined,
    parentId: toFarcasterURI(cast.parentFid, cast.parentHash),
    parent: parent ? formatCast(parent, fidToIdentity) : undefined,
  } as FarcasterReplyData;
};

const formatCast = (
  cast: FarcasterCastRawData,
  fidToIdentity: Record<string, Identity>,
): FarcasterPostData => {
  const embeds = cast.urls
    .map((url) => url.url)
    .concat(cast.casts.map(({ fid, hash }) => toFarcasterURI(fid, hash)));

  return {
    contentId: toFarcasterURI(cast.fid, cast.hash),
    text: cast.text,
    userId: fidToIdentity[cast.fid].id,
    mentions: cast.mentions.map(({ mention, mentionPosition }) => ({
      userId: fidToIdentity[mention].id,
      position: parseInt(mentionPosition),
    })),
    embeds,
    channelId: cast.rootParentUrl,
    rootParentId: toFarcasterURI(cast.rootParentFid, cast.rootParentHash),
    rootParentUserId: fidToIdentity[cast.rootParentFid].id,
  };
};

const getExternalCastData = async (cast: FarcasterCastRawData) => {
  const castRequests = [];
  if (cast.hash !== cast.rootParentHash) {
    castRequests.push({
      fid: cast.rootParentFid,
      hash: cast.rootParentHash,
    });
  }
  if (cast.parentFid && cast.parentHash) {
    castRequests.push({
      fid: cast.parentFid,
      hash: cast.parentHash,
    });
  }

  const casts = await getFarcasterCastsByFidHashes(castRequests);

  const relevantFids = extractFidsFromCast(cast);
  relevantFids.push(...casts.flatMap(extractFidsFromCast));

  const identities = await getIdentitiesForFids([...new Set(relevantFids)]);

  return {
    thread: casts.find((cast) => cast.hash === cast.rootParentHash),
    parent: casts.find((cast) => cast.hash === cast.parentHash),
    identities,
  };
};

const extractFidsFromCast = (cast: FarcasterCastRawData): string[] => {
  return [
    cast.fid,
    cast.parentFid,
    cast.rootParentFid,
    ...cast.mentions.map((mention) => mention.mention),
  ].filter(Boolean);
};
