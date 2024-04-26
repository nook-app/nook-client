"use client";

import "@tamagui/core/reset.css";

import React, { useEffect } from "react";
import { ToastProvider } from "@nook/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider, useAuth } from "@nook/app/context/auth";
import * as amplitude from "@amplitude/analytics-browser";
import { FarcasterUser, Session } from "@nook/app/types";
import { Toasts } from "@nook/app/components/toasts";

const queryClient = new QueryClient();

export const Providers = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | undefined;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId="clsnxqma102qxbyt1ght4j14w"
        config={{
          appearance: { logo: "", theme: "dark" },
          loginMethods: ["farcaster"],
        }}
      >
        <AuthProvider defaultSession={session}>
          <AnalyticsProvider>
            <ToastProvider>
              <Toasts />
              {children}
            </ToastProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
};

const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();

  useEffect(() => {
    if (session?.fid) {
      amplitude.init("7819c3ae9a7a78fc6835dcc60cdeb018", `fid:${session.fid}`);
      amplitude.track("login", { userId: `fid:${session.fid}` });
    }
  }, [session?.fid]);

  return <>{children}</>;
};
