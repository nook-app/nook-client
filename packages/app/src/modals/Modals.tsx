import { ReactNode } from "react";
import { useAppSelector } from "../hooks/useAppSelector";
import { EntityModal } from "@/modals/EntityModal";
import { ChannelModal } from "@/modals/ChannelModal";
import { ModalName, ModalsState } from "./types";

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
    </>
  );
}
