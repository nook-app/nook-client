import {
  FarcasterCastV1,
  Frame,
  FrameButton,
  TransactionTargetResponse,
} from "@nook/common/types";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useRef,
} from "react";
import { submitFrameAction } from "../../../api/farcaster/actions";
import { useToastController } from "@nook/app-ui";
import { CHAINS } from "@nook/common/utils";
import { useRouter } from "next/navigation";

type FrameContextType = {
  host?: string;
  url: string;
  targetUrl: string;
  frame: Frame;
  inputText: string | undefined;
  setInputText: (text: string) => void;
  isLoading: boolean;
  topButtons: FrameButton[];
  bottomButtons: FrameButton[];
  handlePostAction: (frameButton: FrameButton, index: number) => Promise<void>;
  handleNavigateAction: (url: string) => void;
  handleTransactionAction: (
    frameButton: FrameButton,
    index: number,
    hash: `0x${string}`,
  ) => Promise<void>;
  fetchTransactionAction: (
    frameButton: FrameButton,
    index: number,
  ) => Promise<TransactionTargetResponse | undefined>;
};

const FrameContext = createContext<FrameContextType | undefined>(undefined);

type SheetProviderProps = {
  cast?: FarcasterCastV1;
  url: string;
  initialFrame: Frame;
  children: ReactNode;
};

export const FrameProvider = ({
  cast,
  url,
  initialFrame,
  children,
}: SheetProviderProps) => {
  const [frame, setFrame] = useState<Frame>(initialFrame);
  const [inputText, setInputText] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastController();
  const frameRef = useRef(initialFrame.image);
  const router = useRouter();
  const address = undefined;

  if (frameRef.current !== initialFrame.image) {
    setFrame(initialFrame);
    frameRef.current = initialFrame.image;
  }

  const topButtons = frame.buttons?.slice(0, 2) || [];
  const bottomButtons = frame.buttons?.slice(2, 4) || [];

  const handleNavigateAction = useCallback(
    (url: string) => {
      if (url.includes("warpcast.com/~/add-cast-action")) {
        const params = new URL(url).searchParams;
        router.push(`/~/add-cast-action?${params.toString()}`);
      } else {
        window.open(url, "_blank");
      }
    },
    [router],
  );

  const handlePostAction = useCallback(
    async (frameButton: FrameButton, index: number) => {
      const postUrl = frameButton.target ?? frame.postUrl ?? url;
      try {
        setIsLoading(true);
        const response = await submitFrameAction({
          url,
          castFid: cast?.user.fid || "0",
          castHash: cast?.hash || "0x0000000000000000000000000000000000000000",
          action: frameButton.action,
          buttonIndex: index,
          postUrl: postUrl,
          inputText: inputText,
          state: frame.state,
        });
        if ("message" in response) {
          toast.show(response.message);
        } else if (response.location) {
          handleNavigateAction(response.location);
        } else if (response.frame) {
          setFrame(response.frame);
        }
        setInputText(undefined);
      } catch (err) {
        toast.show("Could not fetch frame");
      }
      setIsLoading(false);
    },
    [frame, cast, url, inputText, toast, handleNavigateAction],
  );

  const fetchTransactionAction = useCallback(
    async (frameButton: FrameButton, index: number) => {
      const postUrl = frameButton.target ?? frame.postUrl ?? url;
      try {
        const response = await submitFrameAction({
          url,
          castFid: cast?.user.fid || "0",
          castHash: cast?.hash || "0x0000000000000000000000000000000000000000",
          action: frameButton.action,
          buttonIndex: index,
          postUrl: postUrl,
          inputText: inputText,
          state: frame.state,
          address,
        });
        if ("message" in response) {
          toast.show(response.message);
          return;
        }
        return response.transaction;
      } catch (e) {
        toast.show("Could not fetch transaction");
      }
    },
    [toast, cast, url, inputText, frame, address],
  );

  const handleTransactionAction = useCallback(
    async (frameButton: FrameButton, index: number, hash: `0x${string}`) => {
      const postUrl = frameButton.target ?? frame.postUrl ?? url;
      try {
        setIsLoading(true);
        const response = await submitFrameAction({
          url,
          castFid: cast?.user.fid || "0",
          castHash: cast?.hash || "0x0000000000000000000000000000000000000000",
          action: frameButton.action,
          buttonIndex: index,
          postUrl: postUrl,
          inputText: inputText,
          state: frame.state,
          address,
          transactionId: hash,
        });
        if ("message" in response) {
          toast.show(response.message);
        } else if (response.location) {
          handleNavigateAction(response.location);
        } else if (response.frame) {
          setFrame(response.frame);
        }
        setInputText(undefined);
      } catch (err) {
        toast.show("Could not fetch frame");
      }
      setIsLoading(false);
    },
    [frame, cast, url, inputText, toast, handleNavigateAction, address],
  );

  let targetUrl = url;
  const mintAction = frame.buttons?.find((button) => button.action === "mint");
  if (mintAction?.target) {
    const parts = mintAction.target.split(":");
    const chain = CHAINS[`${parts[0]}:${parts[1]}`];
    if (chain?.simplehashId) {
      targetUrl = `/collectibles/${chain.simplehashId}.${parts[2]}.${parts[3]}`;
    }
  }

  let host: string | undefined;
  try {
    host = new URL(url).host;
  } catch (e) {}

  return (
    <FrameContext.Provider
      value={{
        host,
        url,
        targetUrl,
        frame,
        inputText,
        setInputText,
        isLoading,
        topButtons,
        bottomButtons,
        handlePostAction,
        handleNavigateAction,
        handleTransactionAction,
        fetchTransactionAction,
      }}
    >
      {children}
    </FrameContext.Provider>
  );
};

export const useFrame = () => {
  const context = useContext(FrameContext);
  if (context === undefined) {
    throw new Error("useFrame must be used within a FrameProvider");
  }
  return context;
};
