import { Toast, ToastViewport, useToastState } from "@tamagui/toast";

export const Toasts = () => {
  const toast = useToastState();

  // don't show any toast if no toast is present or it's handled natively
  if (!toast || toast.isHandledNatively) {
    return null;
  }

  return (
    <>
      <ToastViewport
        flexDirection="column"
        style={{
          top: 0,
          left: 0,
          right: 0,
        }}
      />
      <Toast
        animation={"quick"}
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        key={toast.id}
        duration={3000}
      >
        <Toast.Title color="$mauve12">{toast.title}</Toast.Title>
        {toast.message && (
          <Toast.Description color="$mauve12">
            {toast.message}
          </Toast.Description>
        )}
      </Toast>
    </>
  );
};
