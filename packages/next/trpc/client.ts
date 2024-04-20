import {
  createTRPCProxyClient,
  httpBatchLink,
  httpLink,
  splitLink,
} from "@trpc/client";

import type { AppRouter } from "@nook/api/trpc";

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.context.skipBatch === true,
      true: httpLink({
        url: "http://localhost:3000/trpc",
      }),
      false: httpBatchLink({
        url: "http://localhost:3000/trpc",
      }),
    }),
  ],
});

export { TRPCClientError } from "@trpc/client";
