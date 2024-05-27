import { Check, ChevronDown } from "@tamagui/lucide-icons";
import { Adapt, Select, Sheet } from "@nook/app-ui";

export const Dropdown = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <Select value={value} onValueChange={onChange} disablePreventBodyScroll>
      <Select.Trigger
        width="auto"
        iconAfter={ChevronDown}
        borderWidth="$0"
        backgroundColor="$color4"
        borderRadius="$10"
        height="$2.5"
        minHeight="$2.5"
        padding="$0"
        paddingHorizontal="$3"
      >
        <Select.Value placeholder={label} fontWeight="500" />
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
            <Select.Label>{label}</Select.Label>
            {options.map((option, i) => (
              <Select.Item index={i} key={option.value} value={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator marginLeft="auto">
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
};
