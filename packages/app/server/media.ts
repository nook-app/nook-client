"use server";

import { makeRequest } from "../api/utils";
import { ImgurUploadResponse } from "../types";

export const uploadImage = async (
  image: string,
): Promise<ImgurUploadResponse> => {
  return await makeRequest("https://imgur-apiv3.p.rapidapi.com/3/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Client-ID c2593243d3ea679",
      "X-RapidApi-Key": "H6XlGK0RRnmshCkkElumAWvWjiBLp1ItTOBjsncst1BaYKMS8H",
    },
    body: JSON.stringify({ image: image.split(",")[1] }),
  });
};
