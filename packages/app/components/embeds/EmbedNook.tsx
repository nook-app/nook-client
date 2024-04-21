import { UrlContentResponse } from "@nook/common/types";
import { EmbedCast } from "./EmbedCast";
import { useCast } from "../../api/farcaster";

export const EmbedNook = ({ content }: { content: UrlContentResponse }) => {
  const pathname = new URL(content.uri).pathname;

  if (pathname.startsWith("/casts/")) {
    const hash = pathname.split("/")[2];
    return <EmbedNookCast hash={hash} />;
  }

  return <></>;
};

const EmbedNookCast = ({ hash }: { hash: string }) => {
  const { data } = useCast(hash);

  if (!data) {
    return <></>;
  }

  return <EmbedCast cast={data} />;
};
