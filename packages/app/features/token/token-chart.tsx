import { Token } from "@nook/common/types";

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
  return <></>;
};
