export type UnstructuredFrameMetascraperButtonKeys = {
  frameButton1?: string;
  frameButton1Action?: string;
  frameButton1Target?: string;
  frameButton2?: string;
  frameButton2Action?: string;
  frameButton2Target?: string;
  frameButton3?: string;
  frameButton3Action?: string;
  frameButton3Target?: string;
  frameButton4?: string;
  frameButton4Action?: string;
  frameButton4Target?: string;
};

export type FrameMetascraperData = {
  frameVersion?: string;
  frameImage?: string;
  framePostUrl?: string;
  frameRefreshPeriod?: string;
  frameIdemKey?: string;
  frameTextInput?: string;
  frameImageAspectRatio?: string;
  frameState?: string;
} & UnstructuredFrameMetascraperButtonKeys;

export type FrameButtonAction = "post" | "post_redirect" | "mint" | "tx";

export type FrameButton = {
  label: string;
  index: number;
  action?: FrameButtonAction;
  target?: string;
};

export type FrameData = {
  version?: "vNext";
  image?: string;
  postUrl?: string;
  buttons?: FrameButton[];
  refreshPeriod?: number;
  idempotencyKey?: string;
  textInput?: string;
  aspectRatio: "1.91:1" | "1:1";
  state?: string;
};
