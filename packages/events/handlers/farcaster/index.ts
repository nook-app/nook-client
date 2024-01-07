import { EventType } from "@flink/common/types";
import { HandlerArgs } from "../../types";
import { handleCastAdd } from "./castAdd";

export const handleFarcasterEvent = async (args: HandlerArgs) => {
  if (args.rawEvent.source.type === EventType.CAST_ADD) {
    return await handleCastAdd(args);
  }
};
