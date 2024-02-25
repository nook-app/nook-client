import { ReactNode } from "react";
import { useAppSelector } from "../hooks/useAppSelector";
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
      <ModalWrapper name={ModalName.EnableSigner}>
        <EnableSignerModal />
      </ModalWrapper>

      <ModalWrapper name={ModalName.CreatePost}>
        <CreatePostModal />
      </ModalWrapper>
    </>
  );
}
