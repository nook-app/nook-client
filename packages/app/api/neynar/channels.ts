import { FetchCastsResponse } from "../../types";
import { fetchCasts } from "../farcaster";

export const getUserHighlights = async (
  fid: string,
): Promise<FetchCastsResponse> => {
  const res = await fetch(
    `https://api.neynar.com/v2/farcaster/feed/user/${fid}/popular`,
    {
      headers: {
        "Content-Type": "application/json",
        api_key: process.env.NEYNAR_API_KEY as string,
      },
    },
  );

  const neynarCasts: {
    casts: {
      hash: string;
    }[];
  } = await res.json();

  return await fetchCasts(neynarCasts.casts.map((cast) => cast.hash));
};
