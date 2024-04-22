"use client";

import { NookText, View, XStack, useTheme } from "@nook/ui";
import {
  FarcasterFeedFilter,
  FarcasterUser,
  UserFilterType,
} from "../../../types";
import { ReactNode } from "react";
import { Link } from "solito/link";
import { FarcasterCastFeed } from "../cast-feed";

export type UserTabs = "casts" | "replies" | "media" | "frames";

export const UserTabs = ({
  user,
  activeTab,
}: { user: FarcasterUser; activeTab: UserTabs }) => {
  return (
    <View>
      <XStack
        flexGrow={1}
        justifyContent="space-around"
        alignItems="center"
        borderBottomWidth="$0.5"
        borderBottomColor="$color5"
      >
        <UserTab href={`/${user.username}`} isActive={activeTab === "casts"}>
          Casts
        </UserTab>
        <UserTab
          href={`/${user.username}/replies`}
          isActive={activeTab === "replies"}
        >
          Replies
        </UserTab>
        <UserTab
          href={`/${user.username}/media`}
          isActive={activeTab === "media"}
        >
          Media
        </UserTab>
        <UserTab
          href={`/${user.username}/frames`}
          isActive={activeTab === "frames"}
        >
          Frames
        </UserTab>
      </XStack>
      <UserFeed user={user} activeTab={activeTab} />
    </View>
  );
};

const UserTab = ({
  children,
  href,
  isActive,
}: { children: ReactNode; href: string; isActive: boolean }) => {
  return (
    <Link
      href={href}
      viewProps={{
        style: {
          flex: 1,
          flexGrow: 1,
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <View paddingHorizontal="$2" paddingVertical="$4">
        <NookText fontWeight={isActive ? "700" : "500"} muted={!isActive}>
          {children}
        </NookText>
        <View
          position="absolute"
          bottom={0}
          left={0}
          width="100%"
          height="$0.5"
          borderRadius="$4"
          backgroundColor={isActive ? "$color11" : "transparent"}
        />
      </View>
    </Link>
  );
};

export const UserFeed = ({
  user,
  activeTab,
}: { user: FarcasterUser; activeTab: UserTabs }) => {
  let filter: FarcasterFeedFilter = {};
  switch (activeTab) {
    case "casts":
      filter = {
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: [user.fid],
          },
        },
      };
      break;
    case "replies":
      filter = {
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: [user.fid],
          },
        },
        onlyReplies: true,
      };
      break;
    case "media":
      filter = {
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: [user.fid],
          },
        },
        contentTypes: ["image", "video"],
      };
      break;
    case "frames":
      filter = {
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: [user.fid],
          },
        },
        onlyFrames: true,
      };
      break;
  }
  return <FarcasterCastFeed filter={filter} />;
};
