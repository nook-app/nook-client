import { Channel, FarcasterCast, SubmitCastAddRequest } from "@/types";
import { fetchCastFromHub, submitCastAdds, uploadImage } from "@/utils/api";
import { createContext, useContext, ReactNode, useState } from "react";
import { useAuth } from "./auth";
import { SheetType, useSheets } from "./sheet";
import { Keyboard } from "react-native";
import { useToastController } from "@tamagui/toast";
import { router } from "expo-router";
import { useDebouncedNavigate } from "@/hooks/useDebouncedNavigate";
import { useQueryClient } from "@tanstack/react-query";

const TEXT_LENGTH_LIMIT = 320;
const EMBED_LIMIT = 2;

type CreatePostContextType = {
  posts: SubmitCastAddRequest[];
  thread: SubmitCastAddRequest;
  allPostsValid: boolean;
  isPosting: boolean;
  post: () => void;
  updatePost: (index: number, post: SubmitCastAddRequest) => void;
  channel?: Channel;
  updateChannel: (channel?: Channel) => void;
  activePost: SubmitCastAddRequest;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  uploadImages: (index: number, images: string[]) => Promise<void>;
  isUploadingImages: boolean;
  activeEmbedLimit: number;
  activePostLength: number;
  updateText: (index: number, text: string) => void;
  removeEmbed: (index: number, url: string) => void;
  addPost: (index: number) => void;
  removePost: (index: number) => void;
  count: number;
};

const CreatePostContext = createContext<CreatePostContextType | undefined>(
  undefined,
);

type SheetProviderProps = {
  initialPost: SubmitCastAddRequest;
  initialChannel?: Channel;
  children: ReactNode;
};

export const CreatePostProvider = ({
  initialPost,
  initialChannel,
  children,
}: SheetProviderProps) => {
  const [posts, setPosts] = useState<SubmitCastAddRequest[]>([initialPost]);
  const [isPosting, setIsPosting] = useState(false);
  const [channel, setChannel] = useState<Channel | undefined>(initialChannel);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const { signer } = useAuth();
  const { openSheet } = useSheets();
  const queryClient = useQueryClient();
  const toast = useToastController();
  const { navigate } = useDebouncedNavigate();

  const thread = posts[0];
  const activePost = posts[activeIndex];
  const activePostEmbeds =
    (activePost.embeds?.length || 0) +
    (activePost.castEmbedHash ? 1 : 0) +
    (activePost.parsedEmbeds?.length || 0);
  const activePostLength = new Blob([activePost.text]).size;

  const handleUpdatePost = (index: number, post: SubmitCastAddRequest) => {
    setPosts((prev) => {
      const newPosts = [...prev];
      newPosts[index] = post;
      return newPosts;
    });
  };

  const handlePost = async () => {
    if (signer?.state !== "completed") {
      Keyboard.dismiss();
      openSheet(SheetType.EnableSigner);
      return;
    }

    setIsPosting(true);

    const response = await submitCastAdds(
      posts.map((post) => ({
        ...post,
        text: post.text.trim(),
        embeds: (post.embeds || [])
          .concat(post.parsedEmbeds || [])
          .filter((value, index, self) => self.indexOf(value) === index)
          .slice(0, EMBED_LIMIT),
      })),
    );

    if ("message" in response) {
      toast.show(response.message || "An unknown error occurred");
      setIsPosting(false);
      return;
    }

    let currentAttempts = 0;
    let maxAttempts = 60;

    let cast;
    while (currentAttempts < maxAttempts && !cast) {
      currentAttempts++;
      cast = await fetchCastFromHub(response.hash);
      if (cast) break;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!cast) {
      setIsPosting(false);
      toast.show("Failed to find cast after posting.");
      return;
    }

    for (const post of posts) {
      if (!post.parentHash) continue;
      queryClient.setQueryData<FarcasterCast | undefined>(
        ["cast", post.parentHash],
        (prev) =>
          !prev
            ? undefined
            : {
                ...prev,
                engagement: {
                  ...prev.engagement,
                  replies: (prev.engagement.replies || 0) + 1,
                },
              },
      );
    }

    for (const post of posts) {
      if (!post.castEmbedHash) continue;
      queryClient.setQueryData<FarcasterCast | undefined>(
        ["cast", post.castEmbedHash],
        (prev) =>
          !prev
            ? undefined
            : {
                ...prev,
                engagement: {
                  ...prev.engagement,
                  replies: (prev.engagement.quotes || 0) + 1,
                },
              },
      );
    }

    while (router.canGoBack()) router.back();
    navigate(
      {
        pathname: `/casts/[hash]`,
        params: { hash: response.hash },
      },
      {
        segments: true,
      },
    );
  };

  const isValidPost = (post: SubmitCastAddRequest) => {
    const postLength = new Blob([post.text]).size;
    const postEmbeds =
      (post.embeds?.length || 0) +
      (post.castEmbedHash ? 1 : 0) +
      (post.parsedEmbeds?.length || 0);
    if (postLength > TEXT_LENGTH_LIMIT) return false;
    if (postEmbeds > EMBED_LIMIT) return false;
    if (postLength === 0 && postEmbeds === 0) return false;
    return true;
  };

  const handleUpdateChannel = (channel?: Channel) => {
    setChannel(channel);
    setPosts((prev) => {
      const newPosts = [...prev];
      newPosts[0] = { ...newPosts[0], parentUrl: channel?.url };
      return newPosts;
    });
  };

  const handleUploadImages = async (index: number, images: string[]) => {
    setIsUploadingImages(true);

    const results = await Promise.all(
      images.map((image) => uploadImage(image)),
    );

    setPosts((prev) => {
      const newPosts = [...prev];
      newPosts[index] = {
        ...newPosts[index],
        embeds: [
          ...(newPosts[index].embeds || []),
          ...results.map((result) => result.data.link),
        ],
      };
      return newPosts;
    });
    setIsUploadingImages(false);
  };

  const handleUpdateText = (index: number, text: string) => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex) || [];

    setPosts((prev) => {
      const newPosts = [...prev];

      const embedLimit =
        EMBED_LIMIT -
        ((activePost.embeds?.length || 0) + (activePost.castEmbedHash ? 1 : 0));

      newPosts[index] = {
        ...newPosts[index],
        text: text,
        parsedEmbeds: urls
          .filter((embed, index, self) => self.indexOf(embed) === index)
          .slice(0, embedLimit),
      };
      return newPosts;
    });
  };

  const handleRemoveEmbed = (index: number, url: string) => {
    setPosts((prev) => {
      const newPosts = [...prev];
      newPosts[index] = {
        ...newPosts[index],
        embeds: activePost.embeds?.filter((embed) => embed !== url),
        parsedEmbeds: activePost.parsedEmbeds?.filter((embed) => embed !== url),
      };
      return newPosts;
    });
  };

  const handleAddPost = (index: number) => {
    setPosts((prev) => [
      ...prev.slice(0, index + 1),
      {
        text: "",
      },
      ...prev.slice(index + 1),
    ]);
    setActiveIndex(index + 1);
  };

  const handleRemovePost = (index: number) => {
    if (posts.length === 1) return;
    setActiveIndex(index - 1);
    setPosts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <CreatePostContext.Provider
      value={{
        posts,
        thread,
        allPostsValid: posts.every(isValidPost),
        isPosting,
        post: handlePost,
        updatePost: handleUpdatePost,
        channel,
        updateChannel: handleUpdateChannel,
        activePost: posts[activeIndex],
        activeIndex,
        setActiveIndex,
        uploadImages: handleUploadImages,
        isUploadingImages,
        activeEmbedLimit: EMBED_LIMIT - activePostEmbeds,
        activePostLength,
        updateText: handleUpdateText,
        removeEmbed: handleRemoveEmbed,
        addPost: handleAddPost,
        removePost: handleRemovePost,
        count: posts.length,
      }}
    >
      {children}
    </CreatePostContext.Provider>
  );
};

export const useCreatePost = () => {
  const context = useContext(CreatePostContext);
  if (context === undefined) {
    throw new Error("useCreatePost must be used within a CreatePostProvider");
  }
  return context;
};
