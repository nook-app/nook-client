import { Text, styled } from "tamagui";

export const NookText = styled(Text, {
  color: "$mauve12",
  fontSize: 15,
  variants: {
    muted: {
      true: {
        color: "$mauve11",
      },
    },
  } as const,
});
