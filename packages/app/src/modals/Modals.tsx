import { ReactNode } from "react";
import { useAppSelector } from "../hooks/useAppSelector";
import { EntityModal } from "@/modals/EntityModal";
import { ChannelModal } from "@/modals/ChannelModal";
import { ModalName, ModalsState } from "./types";
import { CreatePostModal } from "./CreatePostModal";
import { EnableSignerModal } from "./EnableSignerModal";

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
    </>
  );
}
