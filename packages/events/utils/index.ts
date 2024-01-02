import {
  FarcasterCastData,
  IdentitiesRequest,
  Identity,
  IdentityRequestType,
} from "@flink/common/types";

export const getIdentities = async (
  request: IdentitiesRequest,
): Promise<Identity[]> => {
  const response = await fetch(
    `${process.env.IDENTITY_SERVICE_URL}/identities`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed identities request for ${request.type} ${request.ids}`,
    );
  }

  const { identities } = await response.json();

  if (identities.length !== request.ids.length) {
    throw new Error(
      `Did not receive all identities for ${request.type} ${request.ids}`,
    );
  }

  return identities;
};

export const getIdentitiesForFids = async (
  fids: string[],
): Promise<Identity[]> => {
  return getIdentities({
    type: IdentityRequestType.FID,
    ids: fids,
  });
};

export const getFarcasterCast = async (
  fid: string,
  hash: string,
): Promise<FarcasterCastData | undefined> => {
  const response = await fetch(
    `${process.env.FARCASTER_SERVICE_URL}/cast/${fid}/${hash}`,
  );

  if (!response.ok) {
    if (response.status !== 404) {
      console.log(
        `[events] [get-cast] [${hash}] failed with ${response.status}`,
      );
    }
    return undefined;
  }

  const { cast } = await response.json();

  return cast;
};
