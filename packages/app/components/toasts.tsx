import { Toast, ToastViewport, useToastState } from "@nook/ui";
import { useTheme } from "../context/theme";

export const Toasts = () => {
  const toast = useToastState();
  const { theme } = useTheme();

  // don't show any toast if no toast is present or it's handled natively
  if (!toast || toast.isHandledNatively) {
    return null;
  }

  return (
    <>
      <ToastViewport
        portalToRoot
        flexDirection="column"
        style={{
          bottom: 10,
          right: 10,
        }}
      />
      <Toast
        animation={"quick"}
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        key={toast.id}
        duration={5000}
        backgroundColor={
          ["light", "dark"].includes(theme) ? "$color12" : "$color9"
        }
      >
        <Toast.Title
          color={["light", "dark"].includes(theme) ? "$color1" : "white"}
          fontWeight="500"
        >
          {toast.title}
        </Toast.Title>
        {toast.message && (
          <Toast.Description color="$mauve12">
            {toast.message}
          </Toast.Description>
        )}
      </Toast>
    </>
  );
};
