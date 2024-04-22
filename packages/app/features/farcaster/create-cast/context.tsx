import { createContext, useContext, ReactNode, useState } from "react";
import { useToastController } from "@tamagui/toast";
import { Channel, SubmitCastAddRequest, FarcasterCast } from "../../../types";
import { uploadImage } from "../../../api/image";
import { fetchCast } from "../../../api/farcaster";
import { submitCastAdds } from "../../../api/farcaster/actions";

const TEXT_LENGTH_LIMIT = 320;
const EMBED_LIMIT = 2;

type CreateCastContextType = {
  casts: SubmitCastAddRequest[];
  thread: SubmitCastAddRequest;
  allCastsValid: boolean;
  isCasting: boolean;
  cast: () => void;
  updateCast: (index: number, cast: SubmitCastAddRequest) => void;
  channel?: Channel;
  updateChannel: (channel?: Channel) => void;
  activeCast: SubmitCastAddRequest;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  uploadImages: (index: number, images: string[]) => Promise<void>;
  isUploadingImages: boolean;
  activeEmbedLimit: number;
  activeCastLength: number;
  updateText: (index: number, text: string) => void;
  removeEmbed: (index: number, url: string) => void;
  addCast: (index: number) => void;
  removeCast: (index: number) => void;
  count: number;
};

const CreateCastContext = createContext<CreateCastContextType | undefined>(
  undefined,
);

type SheetProviderProps = {
  initialCast: SubmitCastAddRequest;
  initialChannel?: Channel;
  children: ReactNode;
};

export const CreateCastProvider = ({
  initialCast,
  initialChannel,
  children,
}: SheetProviderProps) => {
  const [casts, setCasts] = useState<SubmitCastAddRequest[]>([initialCast]);
  const [isCasting, setIsCasting] = useState(false);
  const [channel, setChannel] = useState<Channel | undefined>(initialChannel);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const toast = useToastController();

  const thread = casts[0];
  const activeCast = casts[activeIndex];
  const activeCastEmbeds =
    (activeCast.embeds?.length || 0) +
    (activeCast.castEmbedHash ? 1 : 0) +
    (activeCast.parsedEmbeds?.length || 0);
  const activeCastLength = new Blob([activeCast.text]).size;

  const handleUpdateCast = (index: number, cast: SubmitCastAddRequest) => {
    setCasts((prev) => {
      const newCasts = [...prev];
      newCasts[index] = cast;
      return newCasts;
    });
  };

  const handleCast = async (): Promise<FarcasterCast | undefined> => {
    setIsCasting(true);

    const response = await submitCastAdds(
      casts.map((cast) => ({
        ...cast,
        text: cast.text.trim(),
        embeds: (cast.embeds || [])
          .concat(cast.parsedEmbeds || [])
          .filter((value, index, self) => self.indexOf(value) === index)
          .slice(0, EMBED_LIMIT),
      })),
    );

    if ("message" in response) {
      toast.show(response.message || "An unknown error occurred");
      setIsCasting(false);
      return;
    }

    const maxAttempts = 60;

    let cast;
    let currentAttempts = 0;
    while (currentAttempts < maxAttempts && !cast) {
      currentAttempts++;
      cast = await fetchCast(response.hash);
      if (cast) break;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!cast) {
      setIsCasting(false);
      toast.show("Failed to find cast after casting.");
      return;
    }

    return cast;
  };

  const isValidCast = (cast: SubmitCastAddRequest) => {
    const castLength = new Blob([cast.text]).size;
    const castEmbeds =
      (cast.embeds?.length || 0) +
      (cast.castEmbedHash ? 1 : 0) +
      (cast.parsedEmbeds?.length || 0);
    if (castLength > TEXT_LENGTH_LIMIT) return false;
    if (castEmbeds > EMBED_LIMIT) return false;
    if (castLength === 0 && castEmbeds === 0) return false;
    return true;
  };

  const handleUpdateChannel = (channel?: Channel) => {
    setChannel(channel);
    setCasts((prev) => {
      const newCasts = [...prev];
      newCasts[0] = { ...newCasts[0], parentUrl: channel?.url };
      return newCasts;
    });
  };

  const handleUploadImages = async (index: number, images: string[]) => {
    setIsUploadingImages(true);

    const results = await Promise.all(
      images.map((image) => uploadImage(image)),
    );

    setCasts((prev) => {
      const newCasts = [...prev];
      newCasts[index] = {
        ...newCasts[index],
        embeds: [
          ...(newCasts[index].embeds || []),
          ...results.map((result) => result.data.link),
        ],
      };
      return newCasts;
    });
    setIsUploadingImages(false);
  };

  const handleUpdateText = (index: number, text: string) => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex) || [];

    setCasts((prev) => {
      const newCasts = [...prev];

      const embedLimit =
        EMBED_LIMIT -
        ((activeCast.embeds?.length || 0) + (activeCast.castEmbedHash ? 1 : 0));

      newCasts[index] = {
        ...newCasts[index],
        text: text,
        parsedEmbeds: urls
          .filter((embed, index, self) => self.indexOf(embed) === index)
          .slice(0, embedLimit),
      };
      return newCasts;
    });
  };

  const handleRemoveEmbed = (index: number, url: string) => {
    setCasts((prev) => {
      const newCasts = [...prev];
      newCasts[index] = {
        ...newCasts[index],
        embeds: activeCast.embeds?.filter((embed) => embed !== url),
        parsedEmbeds: activeCast.parsedEmbeds?.filter((embed) => embed !== url),
      };
      return newCasts;
    });
  };

  const handleAddCast = (index: number) => {
    setCasts((prev) => [
      ...prev.slice(0, index + 1),
      {
        text: "",
      },
      ...prev.slice(index + 1),
    ]);
    setActiveIndex(index + 1);
  };

  const handleRemoveCast = (index: number) => {
    if (casts.length === 1) return;
    setActiveIndex(index - 1);
    setCasts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <CreateCastContext.Provider
      value={{
        casts,
        thread,
        allCastsValid: casts.every(isValidCast),
        isCasting,
        cast: handleCast,
        updateCast: handleUpdateCast,
        channel,
        updateChannel: handleUpdateChannel,
        activeCast: casts[activeIndex],
        activeIndex,
        setActiveIndex,
        uploadImages: handleUploadImages,
        isUploadingImages,
        activeEmbedLimit: EMBED_LIMIT - activeCastEmbeds,
        activeCastLength,
        updateText: handleUpdateText,
        removeEmbed: handleRemoveEmbed,
        addCast: handleAddCast,
        removeCast: handleRemoveCast,
        count: casts.length,
      }}
    >
      {children}
    </CreateCastContext.Provider>
  );
};

export const useCreateCast = () => {
  const context = useContext(CreateCastContext);
  if (context === undefined) {
    throw new Error("useCreateCast must be used within a CreateCastProvider");
  }
  return context;
};
