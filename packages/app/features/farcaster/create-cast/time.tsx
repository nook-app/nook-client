import React, { useState } from "react";
import { useId } from "react";
import { Input, XGroup, XStack } from "tamagui";
import { usePopoverState } from "@tamagui-extras/core";
import { LmFormFieldContainer } from "@tamagui-extras/form";
import { Select } from "@nook/ui";
import { Check, ChevronDown } from "@tamagui/lucide-icons";
interface LmTimePickerProps {
  time: Date;
}

export function LmTimePicker({ time }: LmTimePickerProps) {
  const id = useId();
  const [hour, setHour] = useState(
    (time.getHours() % 12 || 12).toString().padStart(2, "0"),
  );
  const [amPm, setAmPm] = useState(time.getHours() >= 12 ? "PM" : "AM");
  const [minute, setMinute] = useState(
    time.getMinutes().toString().padStart(2, "0"),
  );

  console.log(`hour: ${hour}, minute: ${minute}`);

  const [selectedTime, setSelectedTime] = useState(new Date());

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const amPmVals = ["AM", "PM"];

  const formatTime = (time: Date) => {
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <XStack>
      <Select value={hour} onValueChange={setHour} disablePreventBodyScroll>
        <Select.Trigger width={220} iconAfter={ChevronDown}>
          <Select.Value placeholder="Something" />
        </Select.Trigger>
        <Select.Viewport>
          <Select.Group>
            <Select.Label>Hour</Select.Label>
            {hours.map((hour, index) => (
              <Select.Item key={hour} value={hour} index={index}>
                <Select.ItemText>{hour}</Select.ItemText>
                <Select.ItemIndicator marginLeft="auto">
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>
      </Select>

      <Select value={minute} onValueChange={setMinute} disablePreventBodyScroll>
        <Select.Trigger width={220} iconAfter={ChevronDown}>
          <Select.Value placeholder="Something" />
        </Select.Trigger>
        <Select.Viewport>
          <Select.Group>
            <Select.Label>Minute</Select.Label>
            {minutes.map((minute, index) => (
              <Select.Item key={minute} value={minute} index={index}>
                <Select.ItemText>{minute}</Select.ItemText>
                <Select.ItemIndicator marginLeft="auto">
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>
      </Select>

      <Select value={amPm} onValueChange={setAmPm} disablePreventBodyScroll>
        <Select.Trigger width={220} iconAfter={ChevronDown}>
          <Select.Value placeholder="Something" />
        </Select.Trigger>
        <Select.Viewport>
          <Select.Group>
            <Select.Label>AM/PM</Select.Label>
            {amPmVals.map((val, index) => (
              <Select.Item key={val} value={val} index={index}>
                <Select.ItemText>{val}</Select.ItemText>
                <Select.ItemIndicator marginLeft="auto">
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>
      </Select>
    </XStack>
  );
}
