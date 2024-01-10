import {
  IdentitiesRequest,
  Identity,
  IdentityRequestType,
} from "@flink/identity/types";

export const get = async (request: IdentitiesRequest): Promise<Identity[]> => {
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

export const getFidIdentityMap = async (
  fids: string[],
): Promise<Record<string, Identity>> => {
  const identities = await get({
    type: IdentityRequestType.FID,
    ids: fids,
  });

  return identities.reduce(
    (acc, identity) => {
      acc[identity.socialAccounts[0].platformId] = identity;
      return acc;
    },
    {} as Record<string, Identity>,
  );
};
