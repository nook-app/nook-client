import { Dialog, View, ScrollView } from "@nook/app-ui";
import { CreateCastItem } from "./form";
import { CreateCastProvider } from "./context";
import { useCallback, useState } from "react";
import { SubmitCastAddRequest } from "@nook/common/types";
import { CreateCastHeaderBar } from "./header-bar";
import { CreateCastActionBar } from "./action-bar";
import { FarcasterCastResponsePreview } from "../../../components/farcaster/casts/cast-preview";
import { useCast } from "../../../hooks/useCast";

export const CreateCastDialog = ({
  children,
  initialState,
  noTrigger,
}: {
  children?: React.ReactNode;
  initialState: SubmitCastAddRequest;
  noTrigger?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Dialog modal disableRemoveScroll open={isOpen} onOpenChange={setIsOpen}>
      {noTrigger ? (
        children
      ) : (
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      )}
      <Dialog.Portal
        justifyContent="flex-start"
        paddingTop="$10"
        $xs={{ paddingTop: "$0" }}
      >
        <Dialog.Overlay
          key="overlay"
          animation="slow"
          opacity={0.75}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "100ms",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          width={600}
          padding="$0"
          $xs={{ width: "100%", height: "100%" }}
          $platform-web={{
            maxHeight: "75vh",
          }}
        >
          <CreateCastProvider initialCast={initialState}>
            <CreateCastHeaderBar onClose={() => setIsOpen(false)} />
            <ScrollView
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="always"
            >
              {initialState.parentHash && (
                <CreateCastParent parentHash={initialState.parentHash} />
              )}
              <View padding="$3" zIndex={1}>
                <CreateCastItem index={0} />
              </View>
            </ScrollView>
            <CreateCastActionBar onSubmit={handleSubmit} />
          </CreateCastProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

const CreateCastParent = ({ parentHash }: { parentHash: string }) => {
  const { cast } = useCast(parentHash);

  if (!cast) return null;

  return <FarcasterCastResponsePreview cast={cast} isConnected />;
};
