import { Button, styled } from "tamagui";

export const NookButton = styled(Button, {
  variants: {
    variant: {
      primary: {
        backgroundColor: "$color9",
        fontWeight: "700",
        fontSize: "$5",
        borderRadius: "$10",
        height: "$5",
        transition: "all 0.2s ease-in",
        hoverStyle: {
          backgroundColor: "$color10",
          transition: "all 0.2s ease-in",
        },
      },
      ghost: {
        justifyContent: "flex-start",
        backgroundColor: "transparent",
        fontWeight: "600",
        fontSize: "$4",
        borderRadius: "$0",
        height: "$5",
        borderWidth: "$0",
        transition: "all 0.2s ease-in",
        hoverStyle: {
          backgroundColor: "$color4",
          transition: "all 0.2s ease-in",
        },
      },
      action: {
        backgroundColor: "$mauve12",
        borderRadius: "$10",
        size: "$3",
        paddingHorizontal: "$3",
        color: "$color1",
        borderWidth: "$0",
        height: "$3",
        hoverStyle: {
          backgroundColor: "$mauve11",
          transition: "all 0.2s ease-in",
        },
        fontWeight: "600",
      },
      "active-action": {
        backgroundColor: "transparent",
        borderColor: "$color6",
        borderRadius: "$10",
        size: "$3",
        height: "$3",
        paddingHorizontal: "$3",
        color: "$color12",
        fontWeight: "500",
        hoverStyle: {
          backgroundColor: "$color4",
          transition: "all 0.2s ease-in",
        },
      },
    },
  } as const,
});
