import { createConfig } from "wagmi";
import { mainnet, optimism, zora, base } from "wagmi/chains";
import { http } from "viem";

export const wagmiConfig = createConfig({
  // @ts-ignore
  chains: [mainnet, optimism, zora, base],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [zora.id]: http(),
    [base.id]: http(),
  },
});
