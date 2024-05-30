import { Token } from "@nook/common/types";
import { useCallback, useEffect, useState } from "react";
import { useTokenChart } from "../../hooks/api/tokens";
import { LineChart } from "react-native-wagmi-charts";
import { haptics } from "../../utils/haptics";
import { Spinner, Text, View, XStack, YStack } from "@nook/app-ui";
import { TouchableOpacity } from "react-native-gesture-handler";

const timeframes = [
  {
    label: "1H",
    value: "hour",
  },
  {
    label: "1D",
    value: "day",
  },
  {
    label: "1W",
    value: "week",
  },
  {
    label: "1M",
    value: "month",
  },
  {
    label: "1Y",
    value: "year",
  },
];

export const TokenChart = ({
  token,
  color,
  onIndexChange,
  onTimeframeChange,
}: {
  token: Token;
  color: string;
  onIndexChange: (data?: { timestamp: number; value: number }) => void;
  onTimeframeChange: (value: number) => void;
}) => {
  const [points, setPoints] = useState<{ timestamp: number; value: number }[]>(
    [],
  );
  const [timeframe, setTimeframe] = useState<string>("day");
  const { data, isLoading } = useTokenChart(token.id, timeframe);

  useEffect(() => {
    if (!data || data.points.length === 0) return;
    const rawPoints =
      data?.points.map(([timestamp, value]) => ({
        timestamp: timestamp * 1000,
        value,
      })) || [];
    const points = smoothPoints(rawPoints);
    const start = points.find((point) => point.value > 0)?.value || 0;
    const end = points[points.length - 1].value;
    onTimeframeChange(((end - start) / start) * 100);
    setPoints(points);
  }, [data, onTimeframeChange]);

  const onCurrentIndexChange = useCallback(
    (index: number) => {
      if (!points[index]) return;
      const { timestamp, value } = points[index];
      onIndexChange({ timestamp, value });
    },
    [points, onIndexChange],
  );

  const handleTimeframeChange = useCallback((value: string) => {
    haptics.impactLight();
    setTimeframe(value);
  }, []);

  if (points.length === 0) {
    if (isLoading) {
      return (
        <View height={200} justifyContent="center" alignItems="center">
          <Spinner />
        </View>
      );
    }
    if (data?.points.length === 0) {
      return null;
    }

    return <View height={200} />;
  }

  return (
    <YStack gap="$4">
      <LineChart.Provider
        data={points}
        onCurrentIndexChange={onCurrentIndexChange}
      >
        <LineChart height={200}>
          <LineChart.Path color={color} />
          <LineChart.CursorCrosshair
            onActivated={haptics.impactLight}
            onEnded={() => {
              haptics.impactLight();
              onIndexChange(undefined);
            }}
            color={color}
          />
        </LineChart>
      </LineChart.Provider>
      <XStack
        justifyContent="space-around"
        alignItems="center"
        paddingHorizontal="$4"
      >
        {timeframes.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            onPress={() => handleTimeframeChange(value)}
          >
            <View paddingHorizontal="$2.5" paddingVertical="$1.5">
              {value === timeframe && (
                <View
                  backgroundColor={color}
                  position="absolute"
                  flexGrow={1}
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  borderRadius="$8"
                  opacity={0.5}
                />
              )}
              <Text fontSize="$4" fontWeight="500">
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </XStack>
    </YStack>
  );
};

const smoothPoints = (
  points: { timestamp: number; value: number }[],
  windowSize = 3,
) => {
  return points.map((point, index, array) => {
    const toAverage = array.slice(
      Math.max(index - windowSize, 0),
      Math.min(index + windowSize + 1, array.length),
    );
    const averageValue =
      toAverage.reduce((acc, curr) => acc + curr.value, 0) / toAverage.length;
    return { ...point, value: averageValue };
  });
};
