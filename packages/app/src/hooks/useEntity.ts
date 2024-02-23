import { selectEntityById } from "@/store/slices/entity";
import { useAppSelector } from "./useAppSelector";

export const useEntity = (entityId?: string) => {
  const entity = useAppSelector((state) =>
    entityId ? selectEntityById(state, entityId) : undefined,
  );

  return entity;
};
