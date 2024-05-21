import { Check, ChevronDown, History } from "@tamagui/lucide-icons";
import { Adapt, Select, Sheet, Text, XStack } from "@nook/app-ui";

export const NftSortMenu = ({
  value,
  onChange,
}: { value: string; onChange: (value: string) => void }) => {
  return (
    <Select value={value} onValueChange={onChange} disablePreventBodyScroll>
      <Select.Trigger
        width="auto"
        iconAfter={ChevronDown}
        borderWidth="$0"
        backgroundColor="$color4"
        borderRadius="$10"
        height="$3"
        minHeight="$3"
        padding="$0"
        paddingHorizontal="$3"
      >
        <Select.Value placeholder="Sort Collectibles" />
      </Select.Trigger>
      <Adapt when="sm" platform="touch">
        <Sheet modal dismissOnSnapToBottom animation="100ms">
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>

          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>
      <Select.Content zIndex={200000}>
        <Select.Viewport minWidth={200}>
          <Select.Group>
            <Select.Label>Sort Collectibles</Select.Label>
            <Select.Item
              index={0}
              key="transfer_time__desc"
              value="transfer_time__desc"
            >
              <Select.ItemText>Most Recent</Select.ItemText>
              <Select.ItemIndicator marginLeft="auto">
                <Check size={16} />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item index={1} key="name__asc" value="name__asc">
              <Select.ItemText>Alphabetical</Select.ItemText>
              <Select.ItemIndicator marginLeft="auto">
                <Check size={16} />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item
              index={2}
              key="floor_price__desc"
              value="floor_price__desc"
            >
              <Select.ItemText>Floor Price</Select.ItemText>
              <Select.ItemIndicator marginLeft="auto">
                <Check size={16} />
              </Select.ItemIndicator>
            </Select.Item>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
};
