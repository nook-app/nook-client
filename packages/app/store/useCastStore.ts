import { create } from "zustand";
import { FarcasterCast } from "../types";

interface CastStore {
  casts: Record<string, FarcasterCast>;
  addCasts: (casts: FarcasterCast[]) => void;
  likeCast: (cast: FarcasterCast) => void;
  unlikeCast: (cast: FarcasterCast) => void;
  recastCast: (cast: FarcasterCast) => void;
  unrecastCast: (cast: FarcasterCast) => void;
}

export const useCastStore = create<CastStore>((set, get) => ({
  casts: {},
  addCasts: (casts: FarcasterCast[]) => {
    const currentCasts = get().casts;
    const newCasts = casts.reduce(
      (acc, cast) => {
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, FarcasterCast>,
    );
    set({ casts: { ...currentCasts, ...newCasts } });
  },
  likeCast: (cast: FarcasterCast) => {
    const storeCast = get().casts[cast.hash] ?? cast;
    const newCast = {
      ...storeCast,
      engagement: {
        ...storeCast.engagement,
        likes: storeCast.engagement.likes + 1,
      },
      context: {
        recasted: storeCast.context?.recasted ?? false,
        liked: true,
      },
    };

    set((state) => ({
      casts: {
        ...state.casts,
        [cast.hash]: newCast,
      },
    }));
  },
  unlikeCast: (cast: FarcasterCast) => {
    const storeCast = get().casts[cast.hash] ?? cast;
    const newCast = {
      ...storeCast,
      engagement: {
        ...storeCast.engagement,
        likes: storeCast.engagement.likes - 1,
      },
      context: {
        recasted: storeCast.context?.recasted ?? false,
        liked: false,
      },
    };

    set((state) => ({
      casts: {
        ...state.casts,
        [cast.hash]: newCast,
      },
    }));
  },
  recastCast: (cast: FarcasterCast) => {
    const storeCast = get().casts[cast.hash] ?? cast;
    const newCast = {
      ...storeCast,
      engagement: {
        ...storeCast.engagement,
        recasts: storeCast.engagement.recasts + 1,
      },
      context: {
        liked: storeCast.context?.liked ?? false,
        recasted: true,
      },
    };

    set((state) => ({
      casts: {
        ...state.casts,
        [cast.hash]: newCast,
      },
    }));
  },
  unrecastCast: (cast: FarcasterCast) => {
    const storeCast = get().casts[cast.hash] ?? cast;
    const newCast = {
      ...storeCast,
      engagement: {
        ...storeCast.engagement,
        recasts: storeCast.engagement.recasts - 1,
      },
      context: {
        liked: storeCast.context?.liked ?? false,
        recasted: false,
      },
    };

    set((state) => ({
      casts: {
        ...state.casts,
        [cast.hash]: newCast,
      },
    }));
  },
}));
