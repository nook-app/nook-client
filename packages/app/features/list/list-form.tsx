import {
  Button,
  Input,
  Label,
  NookText,
  RadioGroup,
  Spinner,
  Switch,
  Text,
  View,
  XStack,
  YStack,
  useToastController,
} from "@nook/app-ui";
import { CdnAvatar } from "../../components/cdn-avatar";
import { useState } from "react";
import { uploadImage } from "../../api/media";
import {
  ImagePicker,
  ImagePickerFile,
} from "../../components/upload/image-picker";
import {
  CreateListRequest,
  List,
  ListType,
  ListVisibility,
} from "@nook/common/types";
import { createList, deleteList, updateList } from "../../api/list";
import { useRouter } from "solito/navigation";
import { useListStore } from "../../store/useListStore";
import { useQueryClient } from "@tanstack/react-query";

export const ListForm = ({
  list,
  allowedType,
}: { list?: List; allowedType?: ListType }) => {
  const [name, setName] = useState(list?.name || "");
  const [description, setDescription] = useState(list?.description || "");
  const [image, setImage] = useState(list?.imageUrl || "");
  const [isPrivate, setIsPrivate] = useState(
    list?.visibility === ListVisibility.PRIVATE,
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [type, setType] = useState<ListType>(
    allowedType || list?.type || ListType.USERS,
  );
  const toast = useToastController();
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateListStore = useListStore((state) => state.updateList);
  const deleteListStore = useListStore((state) => state.deleteList);

  const isDisabled = !name;

  const handleSave = async () => {
    setLoading(true);

    const req: CreateListRequest = {
      name,
      description: description || undefined,
      imageUrl: image || undefined,
      visibility: isPrivate ? ListVisibility.PRIVATE : ListVisibility.PUBLIC,
      type,
    };

    if (list) {
      const updatedList = await updateList(list.id, req);
      updateListStore(updatedList);
      queryClient.invalidateQueries({ queryKey: ["followedUserLists", type] });
      setLoading(false);
      toast.show("List updated!");
      router.back();
    } else {
      const newList = await createList(req);
      updateListStore(newList);
      queryClient.invalidateQueries({ queryKey: ["followedUserLists", type] });
      setLoading(false);
      toast.show("List created!");
      if (allowedType) {
        router.back();
      } else {
        router.push(`/(drawer)/(tabs)/(home)/lists/${newList.id}`);
      }
    }
  };

  const handleDelete = async () => {
    if (!list) return;
    setDeleting(true);
    await deleteList(list.id);
    setDeleting(false);
    toast.show("List deleted!");
    deleteListStore(list.id);
    router.back();
    router.back();
  };

  return (
    <YStack gap="$2" padding="$2.5">
      <YStack theme="surface2">
        <Label>Preview Image</Label>
        <View width="$7" height="$7">
          <UploadImageButton image={image} onUpload={setImage} />
        </View>
      </YStack>
      <YStack theme="surface2">
        <Label>Name</Label>
        <Input value={name} onChangeText={setName} />
      </YStack>
      <YStack theme="surface2">
        <Label>Description</Label>
        <Input value={description} onChangeText={setDescription} />
      </YStack>
      <XStack gap="$6" justifyContent="space-between" paddingRight="$6">
        <YStack theme="surface2">
          <Label>Private</Label>
          <Switch defaultChecked={isPrivate} onCheckedChange={setIsPrivate}>
            <Switch.Thumb backgroundColor="white" />
          </Switch>
        </YStack>
        {!list && !allowedType && (
          <YStack theme="surface2">
            <Text paddingTop="$3" paddingBottom="$2">
              Type
            </Text>
            <XStack>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as ListType)}
                flexDirection="row"
                gap="$6"
              >
                <XStack alignItems="center" gap="$2">
                  <RadioGroup.Item value={ListType.USERS} id="users">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor="users">Users</Label>
                </XStack>
                <XStack alignItems="center" gap="$2">
                  <RadioGroup.Item value={ListType.PARENT_URLS} id="channels">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor="channels">Channels</Label>
                </XStack>
              </RadioGroup>
            </XStack>
          </YStack>
        )}
      </XStack>
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
        disabled={loading || deleting || isDisabled}
        onPress={handleSave}
        marginTop="$4"
      >
        {loading && <Spinner />}
        {!loading && "Save"}
      </Button>
      {list && (
        <Button
          theme="red"
          height="$4"
          width="100%"
          borderRadius="$10"
          fontWeight="600"
          fontSize="$5"
          backgroundColor="$color8"
          borderWidth="$0"
          color="$color12"
          pressStyle={{
            backgroundColor: "$color7",
          }}
          disabledStyle={{
            backgroundColor: "$color6",
          }}
          disabled={loading || deleting || isDisabled}
          onPress={handleDelete}
          marginTop="$4"
        >
          {deleting && <Spinner />}
          {!deleting && "Delete"}
        </Button>
      )}
    </YStack>
  );
};

const UploadImageButton = ({
  image,
  onUpload,
}: { image: string; onUpload: (url: string) => void }) => {
  const [loading, setLoading] = useState(false);

  const handleSelect = async (files: ImagePickerFile[]) => {
    setLoading(true);
    const result = await uploadImage(files[0].file);
    onUpload(result.data.link);
    setLoading(false);
  };

  return (
    <ImagePicker onSelect={handleSelect}>
      <CdnAvatar size="$7" src={image}>
        <View justifyContent="center" alignItems="center" opacity={0.5}>
          <NookText muted fontSize="$3" fontWeight="500">
            optional
          </NookText>
        </View>
      </CdnAvatar>
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
