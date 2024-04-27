import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useMemo,
  useEffect,
} from "react";
import {
  config,
  TamaguiProvider as TamaguiProviderOG,
  Theme,
  ThemeName,
} from "@nook/ui";
import { NextThemeProvider } from "@tamagui/next-theme";
import { useServerInsertedHTML } from "next/navigation";
import { updateTheme } from "../server/user";
import { useAuth } from "./auth";
import { updateSession } from "../utils/local-storage";

type ThemeContextType = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type SheetProviderProps = {
  defaultTheme?: ThemeName;
  children: ReactNode;
};

export const ThemeProvider = ({
  children,
  defaultTheme,
}: SheetProviderProps) => {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme || "pink");
  const { session } = useAuth();

  useEffect(() => {
    if (session?.theme) {
      setTheme(session.theme as ThemeName);
    }
  }, [session]);

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

  const handleSetTheme = async (t: ThemeName) => {
    setTheme(t);
    await updateTheme(t);
    if (session) {
      updateSession({ ...session, theme: t });
    }
  };

  return (
    <NextThemeProvider>
      <TamaguiProviderOG
        config={config}
        disableInjectCSS
        themeClassNameOnRoot
        defaultTheme={"dark"}
      >
        <ThemeContext.Provider
          value={{
            theme,
            setTheme: handleSetTheme,
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
