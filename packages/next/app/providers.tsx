"use client";

import "@tamagui/core/reset.css";
import "@tamagui/polyfill-dev";

import {
  ColorScheme,
  NextThemeProvider,
  useRootTheme,
} from "@tamagui/next-theme";
import { useServerInsertedHTML } from "next/navigation";
import React, { useMemo } from "react";
import { config, TamaguiProvider as TamaguiProviderOG, Theme } from "@nook/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider>{children}</TamaguiProvider>
    </QueryClientProvider>
  );
};

const TamaguiProvider = ({ children }: { children: React.ReactNode }) => {
  const [colorScheme, setColorScheme] = useRootTheme();

  useServerInsertedHTML(() => {
    return (
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: config.getCSS({
            // if you are using "outputCSS" option, you should use this "exclude"
            // if not, then you can leave the option out
            exclude:
              process.env.NODE_ENV === "production" ? "design-system" : null,
          }),
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
        disableRootThemeClass
        defaultTheme={colorScheme}
      >
        <Theme name="pink">{contents}</Theme>
      </TamaguiProviderOG>
    </NextThemeProvider>
  );
};
