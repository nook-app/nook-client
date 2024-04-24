"use client";

import {
  ColorScheme,
  NextThemeProvider,
  useRootTheme,
} from "@tamagui/next-theme";
import { useServerInsertedHTML } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import {
  config,
  TamaguiProvider as TamaguiProviderOG,
  Theme,
  ThemeName,
} from "@nook/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider, useAuth } from "@nook/app/context/auth";
import * as amplitude from "@amplitude/analytics-browser";
import { FarcasterUser, Session } from "@nook/app/types";

const queryClient = new QueryClient();

export const Providers = ({
  children,
  session,
  user,
}: {
  children: React.ReactNode;
  session: Session | undefined;
  user: FarcasterUser | undefined;
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
        <AuthProvider defaultSession={session} defaultUser={user}>
          <AnalyticsProvider>
            <TamaguiProvider
              defaultTheme={session?.theme as ThemeName | undefined}
            >
              {children}
            </TamaguiProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
};

const TamaguiProvider = ({
  children,
  defaultTheme,
}: { children: React.ReactNode; defaultTheme?: ThemeName }) => {
  const [colorScheme, setColorScheme] = useRootTheme();

  useServerInsertedHTML(() => {
    return (
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: config.getCSS(),
        }}
      />
    );
  });

  const contents = useMemo(() => {
    return <>{children}</>;
  }, [children]);

  return (
    <NextThemeProvider onChangeTheme={(t) => setColorScheme(t as ColorScheme)}>
      <TamaguiProviderOG
        config={config}
        disableInjectCSS
        themeClassNameOnRoot
        defaultTheme={colorScheme}
      >
        <Theme name={defaultTheme}>{contents}</Theme>
      </TamaguiProviderOG>
    </NextThemeProvider>
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
