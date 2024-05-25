import { Token, TokenHoldings } from "@nook/common/types";
import { create } from "zustand";

interface TokenStore {
  tokens: Record<string, Token>;
  tokenHoldings: Record<string, TokenHoldings>;
  addTokens: (tokens: Token[]) => void;
  addTokenHoldings: (holdings: TokenHoldings[]) => void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  tokens: {},
  tokenHoldings: {},
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
  addTokenHoldings: (holdings: TokenHoldings[]) => {
    const currentHoldings = get().tokenHoldings;
    const newHoldings = holdings.reduce(
      (acc, holding) => {
        if (acc[holding.tokens[0]]) return acc;
        acc[holding.tokens[0]] = holding;
        return acc;
      },
      {} as Record<string, TokenHoldings>,
    );
    set({
      tokenHoldings: { ...currentHoldings, ...newHoldings },
    });
  },
}));
