import {
  Button,
  Input,
  Label,
  NookText,
  Spinner,
  View,
  YStack,
  useToastController,
} from "@nook/app-ui";
import { CdnAvatar } from "../../components/cdn-avatar";
import { useState } from "react";
import { useAuth } from "../../context/auth";
import { submitUserDataAdd } from "../../api/farcaster/actions";
import { uploadImage } from "../../api/media";
import { ImagePicker } from "../../components/upload/image-picker";

export const ProfileSettings = () => {
  const { user, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [pfp, setPfp] = useState(user?.pfp || "");
  const [loading, setLoading] = useState(false);
  const toast = useToastController();

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

    toast.show("Profile updated!");
  };

  return (
    <YStack gap="$2" padding="$2.5">
      <NookText muted>
        Set your profile picture, display name, and bio. You can change this at
        anytime.
      </NookText>
      <YStack theme="surface2">
        <Label>Profile Picture</Label>
        <UploadImageButton image={pfp} onUpload={setPfp} />
      </YStack>
      <YStack theme="surface2">
        <Label>Display Name</Label>
        <Input value={displayName} onChangeText={setDisplayName} />
      </YStack>
      <YStack theme="surface2">
        <Label>Bio</Label>
        <Input value={bio} onChangeText={setBio} />
      </YStack>
      <Button
        height="$4"
        width="100%"
        borderRadius="$10"
        fontWeight="600"
        fontSize="$5"
        backgroundColor="$mauve12"
        borderWidth="$0"
        color="$mauve1"
        pressStyle={{
          backgroundColor: "$mauve11",
        }}
        disabledStyle={{
          backgroundColor: "$mauve10",
        }}
        disabled={loading || isDisabled}
        onPress={handleSave}
        marginTop="$4"
      >
        {loading && <Spinner />}
        {!loading && "Save"}
      </Button>
    </YStack>
  );
};

const UploadImageButton = ({
  image,
  onUpload,
}: { image: string; onUpload: (url: string) => void }) => {
  const [loading, setLoading] = useState(false);

  const handleSelect = async (newImage: string) => {
    setLoading(true);
    const result = await uploadImage(newImage);
    onUpload(result.data.link);
    setLoading(false);
  };

  return (
    <ImagePicker onSelect={handleSelect}>
      <CdnAvatar size="$7" src={image} />
      {loading && (
        <View
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          width="$7"
          height="$7"
          justifyContent="center"
          alignItems="center"
          backgroundColor="$color1"
          opacity={0.75}
        >
          <Spinner />
        </View>
      )}
    </ImagePicker>
  );
};
