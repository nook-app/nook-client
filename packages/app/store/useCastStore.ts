import { create } from "zustand";
import { FarcasterCastV1, NotificationResponse } from "@nook/common/types";

interface CastStore {
  casts: Record<string, FarcasterCastV1>;
  addCasts: (casts: FarcasterCastV1[]) => void;
  addCastsFromCasts: (casts: FarcasterCastV1[]) => void;
  addCastsFromNotifications: (notifications: NotificationResponse[]) => void;
  likeCast: (cast: FarcasterCastV1) => void;
  unlikeCast: (cast: FarcasterCastV1) => void;
  recastCast: (cast: FarcasterCastV1) => void;
  unrecastCast: (cast: FarcasterCastV1) => void;
}

export const useCastStore = create<CastStore>((set, get) => ({
  casts: {},
  addCasts: (casts: FarcasterCastV1[]) => {
    const currentCasts = get().casts;
    const newCasts = casts.reduce(
      (acc, cast) => {
        if (currentCasts[cast.hash]) return acc;
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, FarcasterCastV1>,
    );
    set({ casts: { ...currentCasts, ...newCasts } });
  },
  addCastsFromCasts: (inputCasts: FarcasterCastV1[]) => {
    const currentCasts = get().casts;
    const casts = inputCasts.flatMap((cast) => {
      const casts = [cast];
      // for (const embed of cast.embedCasts) {
      //   casts.push(embed);
      // }
      // if (cast.parent) {
      //   casts.push(cast.parent);
      //   for (const embed of cast.parent.embedCasts) {
      //     casts.push(embed);
      //   }
      // }
      return casts;
    });
    const newCasts = casts.reduce(
      (acc, cast) => {
        if (currentCasts[cast.hash]) return acc;
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, FarcasterCastV1>,
    );
    set({ casts: { ...currentCasts, ...newCasts } });
  },
  addCastsFromNotifications: (notifications: NotificationResponse[]) => {
    const currentCasts = get().casts;
    const casts = notifications.flatMap((notification) => {
      if (!notification.cast) return [];
      const cast = notification.cast;
      const casts = [cast];
      for (const embed of cast.embedCasts) {
        casts.push(embed);
      }
      if (cast.parent) {
        casts.push(cast.parent);
        for (const embed of cast.parent.embedCasts) {
          casts.push(embed);
        }
      }
      return casts;
    });
    const newCasts = casts.reduce(
      (acc, cast) => {
        if (currentCasts[cast.hash]) return acc;
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, FarcasterCastV1>,
    );
    set({ casts: { ...currentCasts, ...newCasts } });
  },
  likeCast: (cast: FarcasterCastV1) => {
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
  unlikeCast: (cast: FarcasterCastV1) => {
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
  recastCast: (cast: FarcasterCastV1) => {
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
  unrecastCast: (cast: FarcasterCastV1) => {
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
