"use client";

import { Label, RadioGroup, NookText, XStack, YStack } from "@nook/app-ui";
import { Display, List } from "@nook/common/types";
import { useListStore } from "../../store/useListStore";
import { updateList } from "../../api/list";
import { useState } from "react";

export const ListDisplayPicker = ({ list }: { list: List }) => {
  const updateListStore = useListStore((state) => state.updateList);
  const [displayMode, setDisplayMode] = useState<Display>(
    list.displayMode || Display.CASTS,
  );

  const handleSelect = async (displayMode: Display) => {
    setDisplayMode(displayMode);
    updateListStore({ ...list, displayMode });
    await updateList(list.id, { ...list, displayMode });
  };

  return (
    <RadioGroup
      value={displayMode}
      onValueChange={(v) => handleSelect(v as Display)}
      gap="$6"
      padding="$2.5"
    >
      <XStack alignItems="center" gap="$2">
        <RadioGroup.Item value={Display.CASTS} id="casts">
          <RadioGroup.Indicator />
        </RadioGroup.Item>
        <Label htmlFor="casts" unstyled>
          <YStack gap="$1" paddingLeft="$1.5">
            <NookText>Default</NookText>
            <NookText muted>
              Displays casts in the Twitter-style format.
            </NookText>
          </YStack>
        </Label>
      </XStack>
      <XStack alignItems="center" gap="$2">
        <RadioGroup.Item value={Display.FRAMES} id="frames">
          <RadioGroup.Indicator />
        </RadioGroup.Item>
        <Label htmlFor="frames" unstyled>
          <YStack gap="$1" paddingLeft="$1.5">
            <NookText>Frames</NookText>
            <NookText muted>Displays casts with frames expanded.</NookText>
          </YStack>
        </Label>
      </XStack>
      <XStack alignItems="center" gap="$2">
        <RadioGroup.Item value={Display.MEDIA} id="media">
          <RadioGroup.Indicator />
        </RadioGroup.Item>
        <Label htmlFor="media" unstyled>
          <YStack gap="$1" paddingLeft="$1.5">
            <NookText>Media</NookText>
            <NookText muted>Displays casts with media expanded.</NookText>
          </YStack>
        </Label>
      </XStack>
      <XStack alignItems="center" gap="$2">
        <RadioGroup.Item value={Display.GRID} id="grid">
          <RadioGroup.Indicator />
        </RadioGroup.Item>
        <Label htmlFor="grid" unstyled>
          <YStack gap="$1" paddingLeft="$1.5">
            <NookText>Media Grid</NookText>
            <NookText muted>Display media in a 3x3 grid.</NookText>
          </YStack>
        </Label>
      </XStack>
    </RadioGroup>
  );
};
