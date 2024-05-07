"use client";

import {
  Button,
  Input,
  NookButton,
  NookText,
  Popover,
  Separator,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { User } from "@nook/common/types";
import { VolumeX } from "@tamagui/lucide-icons";
import { muteWord, unmuteWord } from "../../server/settings";
import { useState } from "react";

export const MutedWords = ({ settings }: { settings: User }) => {
  const [words, setWords] = useState<string[]>(settings.mutedWords);

  const handleUnmuteWord = async (word: string) => {
    await unmuteWord(word);
    setWords((prev) => prev.filter((w) => w !== word));
  };

  const handleMuteWord = async (word: string) => {
    if (!word) return;
    if (words.includes(word)) return;
    await muteWord(word);
    setWords((prev) => [...prev, word]);
  };

  return (
    <YStack>
      <XStack padding="$4" justifyContent="space-between" alignItems="center">
        <NookText muted>
          Posts containing muted words won't show up across the app.
        </NookText>
        <AddMutedWord onSubmit={handleMuteWord} />
      </XStack>
      <Separator borderColor="$borderColorBg" />
      {words.map((word) => (
        <MutedWord key={word} word={word} onPress={handleUnmuteWord} />
      ))}
    </YStack>
  );
};

const MutedWord = ({
  word,
  onPress,
}: { word: string; onPress: (url: string) => void }) => {
  return (
    <XStack
      alignItems="center"
      padding="$4"
      hoverStyle={{
        backgroundColor: "$color2",
        transform: "all 0.2s ease-in-out",
      }}
      justifyContent="space-between"
    >
      <NookText>{word}</NookText>
      <View
        cursor="pointer"
        width="$2.5"
        height="$2.5"
        justifyContent="center"
        alignItems="center"
        borderRadius="$10"
        group
        hoverStyle={{
          // @ts-ignore
          transition: "all 0.2s ease-in-out",
          backgroundColor: "$red3",
        }}
        onPress={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPress(word);
        }}
      >
        <VolumeX
          size={20}
          $group-hover={{
            color: "$red9",
            opacity: 1,
          }}
          color="$red9"
        />
      </View>
    </XStack>
  );
};

const AddMutedWord = ({ onSubmit }: { onSubmit: (word: string) => void }) => {
  const [word, setWord] = useState("");
  return (
    <Popover size="$5" allowFlip>
      <Popover.Trigger asChild>
        <NookButton variant="action">Add word</NookButton>
      </Popover.Trigger>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColorBg"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding="$3"
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColorBg" />

        <YStack space="$3">
          <XStack space="$3">
            <Input
              size="$3"
              placeholder="Enter word or phrase..."
              borderColor="$color5"
              focusVisibleStyle={{ outlineWidth: 0 }}
              value={word}
              onChangeText={setWord}
            />
          </XStack>

          <Popover.Close asChild>
            <NookButton
              size="$3"
              onPress={() => onSubmit(word)}
              borderWidth="$0"
            >
              Mute Word
            </NookButton>
          </Popover.Close>
        </YStack>
      </Popover.Content>
    </Popover>
  );
};
