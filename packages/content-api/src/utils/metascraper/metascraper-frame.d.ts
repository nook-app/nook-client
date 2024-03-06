import { RulesOptions } from "metascraper";
export declare const metascraperFrame: () => {
    [x: string]: RulesOptions | RulesOptions[] | undefined;
    audio?: RulesOptions | RulesOptions[] | undefined;
    author?: RulesOptions | RulesOptions[] | undefined;
    date?: RulesOptions | RulesOptions[] | undefined;
    description?: RulesOptions | RulesOptions[] | undefined;
    image?: RulesOptions | RulesOptions[] | undefined;
    lang?: RulesOptions | RulesOptions[] | undefined;
    logo?: RulesOptions | RulesOptions[] | undefined;
    publisher?: RulesOptions | RulesOptions[] | undefined;
    title?: RulesOptions | RulesOptions[] | undefined;
    url?: RulesOptions | RulesOptions[] | undefined;
    video?: RulesOptions | RulesOptions[] | undefined;
} & {
    test?: ((options: import("metascraper").RulesTestOptions) => boolean) | undefined;
} & {
    frameVersion?: RulesOptions | RulesOptions[] | undefined;
    frameImage?: RulesOptions | RulesOptions[] | undefined;
    framePostUrl?: RulesOptions | RulesOptions[] | undefined;
    frameRefreshPeriod?: RulesOptions | RulesOptions[] | undefined;
    frameIdemKey?: RulesOptions | RulesOptions[] | undefined;
    frameTextInput?: RulesOptions | RulesOptions[] | undefined;
    frameImageAspectRatio?: RulesOptions | RulesOptions[] | undefined;
    frameState?: RulesOptions | RulesOptions[] | undefined;
    frameButton1?: RulesOptions | RulesOptions[] | undefined;
    frameButton1Action?: RulesOptions | RulesOptions[] | undefined;
    frameButton1Target?: RulesOptions | RulesOptions[] | undefined;
    frameButton2?: RulesOptions | RulesOptions[] | undefined;
    frameButton2Action?: RulesOptions | RulesOptions[] | undefined;
    frameButton2Target?: RulesOptions | RulesOptions[] | undefined;
    frameButton3?: RulesOptions | RulesOptions[] | undefined;
    frameButton3Action?: RulesOptions | RulesOptions[] | undefined;
    frameButton3Target?: RulesOptions | RulesOptions[] | undefined;
    frameButton4?: RulesOptions | RulesOptions[] | undefined;
    frameButton4Action?: RulesOptions | RulesOptions[] | undefined;
    frameButton4Target?: RulesOptions | RulesOptions[] | undefined;
};
