import { ObjectId } from "mongodb";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const convertStringsToObjectId = (obj: any) => {
  for (const key in obj) {
    if (typeof obj[key] === "string" && ObjectId.isValid(obj[key])) {
      obj[key] = new ObjectId(obj[key]);
    } else if (typeof obj[key] === "object") {
      convertStringsToObjectId(obj[key]);
    }
  }
  return obj;
};
