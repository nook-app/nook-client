import { createContext, useContext, ReactNode, useState, useMemo } from "react";
import {
  config,
  TamaguiProvider as TamaguiProviderOG,
  Theme,
  ThemeName,
} from "@nook/ui";
import {
  ColorScheme,
  NextThemeProvider,
  useRootTheme,
} from "@tamagui/next-theme";
import { useServerInsertedHTML } from "next/navigation";

type ThemeContextType = {
  theme: ThemeName;
  setTheme: (theme: string) => void;
  colorScheme: "light" | "dark";
  colorSchemeOverride: string | null;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type SheetProviderProps = {
  defaultTheme?: ThemeName;
  children: ReactNode;
};

export const ThemeProvider = ({
  defaultTheme,
  children,
}: SheetProviderProps) => {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme || "pink");
  const [colorScheme, setColorScheme] = useRootTheme();
  const [colorSchemeOverride, setColorSchemeOverride] = useState<string | null>(
    null,
  );

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
        <ThemeContext.Provider
          value={{
            theme,
            setTheme: (t) => setTheme(t as ThemeName),
            colorScheme,
            colorSchemeOverride,
          }}
        >
          <Theme name={theme}>{contents}</Theme>
        </ThemeContext.Provider>
      </TamaguiProviderOG>
    </NextThemeProvider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
