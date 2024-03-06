import { useAppSelector } from "@/hooks/useAppSelector";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { Theme } from "tamagui";

type BottomSheetContextState = {
  isSheetReady: boolean;
};

const BottomSheetContext = createContext<BottomSheetContextState | undefined>(
  undefined,
);

export function BottomSheetContextProvider({
  children,
  isSheetReady,
}: {
  children: ReactNode;
  isSheetReady: boolean;
}): JSX.Element {
  const theme = useAppSelector((state) => state.user.theme);
  const state = useMemo<BottomSheetContextState>(
    (): BottomSheetContextState => ({
      isSheetReady,
    }),
    [isSheetReady],
  );

  return (
    <BottomSheetContext.Provider value={state}>
      <Theme name={theme || "gray"}>{children}</Theme>
    </BottomSheetContext.Provider>
  );
}

export const useBottomSheetContext = (): BottomSheetContextState => {
  const bottomSheetContext = useContext(BottomSheetContext);

  if (bottomSheetContext === undefined) {
    throw new Error(
      "`useBottomSheetContext` must be used inside of `BottomSheetContextProvider`",
    );
  }

  return bottomSheetContext;
};
