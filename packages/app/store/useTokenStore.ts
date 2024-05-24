import { Token } from "@nook/common/types";
import { create } from "zustand";

interface TokenStore {
  tokens: Record<string, Token>;
  addTokens: (tokens: Token[]) => void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  tokens: {},
  addTokens: (tokens: Token[]) => {
    const currentTokens = get().tokens;
    const newTokens = tokens.reduce(
      (acc, token) => {
        if (acc[token.id]) return acc;
        acc[token.id] = token;
        return acc;
      },
      {} as Record<string, Token>,
    );
    set({
      tokens: { ...currentTokens, ...newTokens },
    });
  },
}));
