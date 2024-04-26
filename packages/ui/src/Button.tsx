import { Button, styled } from "tamagui";

export const NookButton = styled(Button, {
  variants: {
    variant: {
      primary: {
        backgroundColor: "$color11",
        fontWeight: "700",
        fontSize: "$5",
        borderRadius: "$10",
        height: "$5",
        hoverStyle: {
          backgroundColor: "$color10",
          transition: "all 0.2s ease-in-out",
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
        hoverStyle: {
          backgroundColor: "$color4",
          transition: "all 0.2s ease-in-out",
        },
      },
      action: {
        backgroundColor: "$mauve12",
        borderRadius: "$10",
        paddingHorizontal: "$4",
        color: "$color1",
        borderWidth: "$0",
        height: "$3",
        fontWeight: "600",
        hoverStyle: {
          backgroundColor: "$mauve11",
          transition: "all 0.2s ease-in-out",
        },
      },
      "active-action": {
        backgroundColor: "transparent",
        borderColor: "$color6",
        borderRadius: "$10",
        height: "$3",
        paddingHorizontal: "$4",
        color: "$color12",
        fontWeight: "600",
        hoverStyle: {
          backgroundColor: "$color4",
          transition: "all 0.2s ease-in-out",
        },
      },
    },
  } as const,
});
