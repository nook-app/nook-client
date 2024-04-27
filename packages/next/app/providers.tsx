"use client";

import React, { useEffect } from "react";
import { ThemeName, ToastProvider } from "@nook/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider, useAuth } from "@nook/app/context/auth";
import * as amplitude from "@amplitude/analytics-browser";
import { Toasts } from "@nook/app/components/toasts";
import { Session } from "@nook/app/types";
import { ThemeProvider } from "@nook/app/context/theme";

const queryClient = new QueryClient();

export const Providers = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session;
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
        <AuthProvider>
          <ThemeProvider defaultTheme={session?.theme as ThemeName | undefined}>
            <AnalyticsProvider>
              <ToastProvider>
                <Toasts />
                {children}
              </ToastProvider>
            </AnalyticsProvider>
          </ThemeProvider>
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
    }
  }, [session?.fid]);

  return <>{children}</>;
};
