import { NookPanel, NookPanelType } from "@flink/common/types";
import { ContentFeedPanel } from "./contentFeed";

export const Panel = ({ panel }: { panel: NookPanel }) => {
  switch (panel.type) {
    case NookPanelType.ContentFeed:
      return <ContentFeedPanel args={panel.args} />;
    default:
      return null;
  }
};
