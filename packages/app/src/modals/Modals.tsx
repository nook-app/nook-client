import { ReactNode } from "react";
import { useAppSelector } from "../hooks/useAppSelector";
import { EntityModal } from "@/modals/EntityModal";
import { ChannelModal } from "@/modals/ChannelModal";
import { ModalName, ModalsState } from "./types";
import { CreatePostModal } from "./CreatePostModal";
import { EnableSignerModal } from "./EnableSignerModal";
import { ContentQuotesModal } from "./ContentQuotesModal";
import { ContentLikesModal } from "./ContentLikesModal";
import { ContentRepostsModal } from "./ContentRepostsModal";
import { EntityFollowersModal } from "./EntityFollowersModal";
import { EntityFollowingModal } from "./EntityFollowingModal";

function ModalWrapper({
  name,
  children,
}: {
  name: keyof ModalsState;
  children: ReactNode;
}) {
  const modalState = useAppSelector((state) => state.navigator.modals[name]);

  if (!modalState.isOpen) {
    return null;
  }

  return children;
}

export function Modals() {
  return (
    <>
      <ModalWrapper name={ModalName.Entity}>
        <EntityModal />
      </ModalWrapper>

      <ModalWrapper name={ModalName.Channel}>
        <ChannelModal />
      </ModalWrapper>

      <ModalWrapper name={ModalName.EnableSigner}>
        <EnableSignerModal />
      </ModalWrapper>

      <ModalWrapper name={ModalName.CreatePost}>
        <CreatePostModal />
      </ModalWrapper>

      <ModalWrapper name={ModalName.ContentQuotes}>
        <ContentQuotesModal />
      </ModalWrapper>

      <ModalWrapper name={ModalName.ContentLikes}>
        <ContentLikesModal />
      </ModalWrapper>

      <ModalWrapper name={ModalName.ContentReposts}>
        <ContentRepostsModal />
      </ModalWrapper>

      <ModalWrapper name={ModalName.EntityFollowers}>
        <EntityFollowersModal />
      </ModalWrapper>

      <ModalWrapper name={ModalName.EntityFollowing}>
        <EntityFollowingModal />
      </ModalWrapper>
    </>
  );
}
