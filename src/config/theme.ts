import deepmerge from "deepmerge";
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
} from "react-native-paper";

import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export const PaperLightTheme = deepmerge(MD3LightTheme, {
  colors: {
    primary: "rgba(206,33,39,255)",
    background: "rgb(255, 255, 255)",
    surfaceVariant: "#f0f0f0",
  },
});

export const PaperDarkTheme = deepmerge(MD3DarkTheme, {
  colors: {
    primary: "rgba(206,33,39,255)",
  },
});

export const {
  LightTheme: CombinedDefaultTheme,
  DarkTheme: CombinedDarkTheme,
} = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DarkTheme,
  materialLight: PaperLightTheme,
  materialDark: PaperDarkTheme,
});

export const NavigationDarkTheme = deepmerge(CombinedDarkTheme, {
  colors: {
    card: PaperDarkTheme.colors.background,
  },
});

export const NavigationLightTheme = deepmerge(CombinedDefaultTheme, {
  colors: {
    card: PaperLightTheme.colors.background,
  },
});
