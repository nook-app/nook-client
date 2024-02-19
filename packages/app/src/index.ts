import "text-encoding-polyfill";

import { App } from "./App";
import { registerRootComponent } from "expo";
import { LogBox } from "react-native";

LogBox.ignoreLogs([/bad setState[\s\S]*Themed/]);

registerRootComponent(App);
