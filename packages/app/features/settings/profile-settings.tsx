import {
  Input,
  NookButton,
  NookText,
  Spinner,
  View,
  YStack,
} from "@nook/app-ui";
import { CdnAvatar } from "../../components/cdn-avatar";
import { useRef, useState } from "react";
import { useAuth } from "../../context/auth";
import { submitUserDataAdd } from "../../api/farcaster/actions";
import { uploadImage } from "../../api/media";

export const ProfileSettings = () => {
  const { user, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [pfp, setPfp] = useState(user?.pfp || "");
  const [loading, setLoading] = useState(false);

  const isDisabled =
    !displayName ||
    !bio ||
    !pfp ||
    (user?.displayName === displayName &&
      user?.bio === bio &&
      user?.pfp === pfp);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    await submitUserDataAdd({
      type: 1,
      value: pfp,
    });

    await submitUserDataAdd({
      type: 2,
      value: displayName,
    });

    await submitUserDataAdd({
      type: 3,
      value: bio,
    });

    setUser({ ...user, displayName, bio, pfp });
    setLoading(false);
  };

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$2">
        <NookText variant="label">Profile Settings</NookText>
        <NookText muted>
          Set your profile picture, display name, and bio. You can change this
          at anytime.
        </NookText>
      </YStack>
      <YStack gap="$1">
        <NookText muted>Profile Picture</NookText>
        <UploadImageButton image={pfp} onUpload={setPfp} />
      </YStack>
      <YStack gap="$1">
        <NookText muted>Display Name</NookText>
        <Input value={displayName} onChangeText={setDisplayName} />
      </YStack>
      <YStack gap="$1">
        <NookText muted>Bio</NookText>
        <Input value={bio} onChangeText={setBio} />
      </YStack>
      <NookButton
        variant="action"
        disabled={loading || isDisabled}
        disabledStyle={{ opacity: 0.5 }}
        onPress={handleSave}
      >
        {loading ? <Spinner /> : "Save"}
      </NookButton>
    </YStack>
  );
};

const UploadImageButton = ({
  image,
  onUpload,
}: { image: string; onUpload: (url: string) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]; // Get only the first file
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const result = await uploadImage(e.target.result as string);
        onUpload(result.data.link);
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <View
      onPress={(e) => {
        fileInputRef.current?.click();
      }}
      cursor="pointer"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageSelect}
      />
      <CdnAvatar size="$7" src={image}>
        <View
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          {loading && <Spinner />}
        </View>
      </CdnAvatar>
    </View>
  );
};
