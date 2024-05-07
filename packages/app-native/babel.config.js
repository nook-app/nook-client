module.exports = (api) => {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxRuntime: "automatic" }]],
    plugins: [
      require.resolve("expo-router/babel"),
      [
        require.resolve("babel-plugin-module-resolver"),
        {
          root: ["../.."],
          alias: {
            app: "../../packages/app",
            "@nook/app-ui": "../../packages/app-ui",
          },
          extensions: [".js", ".jsx", ".tsx", ".ios.js", ".android.js"],
        },
      ],
      "react-native-reanimated/plugin",
      ...(process.env.EAS_BUILD_PLATFORM === "android"
        ? []
        : [
            [
              "@tamagui/babel-plugin",
              {
                components: ["@nook/app-ui", "tamagui"],
                config: "../../packages/app-ui/src/tamagui.config.ts",
              },
            ],
          ]),
    ],
  };
};
