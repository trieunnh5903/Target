import deepmerge from "deepmerge";
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  useTheme,
} from "react-native-paper";

import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export const TagColors = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#008000",
  "#0000FF",
  "#FFA500",
  "#FFFF00",
  "#00FFFF",
  "#FF00FF",
  "#A52A2A",
  "#4B0082",
  "#EE82EE",
  "#A9A9A9",
];

export const PaperLightTheme = deepmerge(MD3LightTheme, {
  colors: {
    primary: "rgba(206,33,39,255)",
    background: "rgb(255, 255, 255)",
    surfaceVariant: "#f0f0f0",
    icon: "black",
    onSecondaryContainer: "rgba(206,33,39,255)",
    secondaryContainer: "rgba(206,33,39,0.2)",
  },
});

export const PaperDarkTheme = deepmerge(MD3DarkTheme, {
  colors: {
    primary: "rgba(206,33,39,255)",
    onSurfaceVariant: "gray",
    icon: "gray",
    onSecondaryContainer: "rgba(206,33,39,255)",
    secondaryContainer: "rgba(206,33,39,0.2)",
    onPrimary: "rgb(255, 255, 255)",
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
    border: DarkTheme.colors.border,
  },
});

export const NavigationLightTheme = deepmerge(CombinedDefaultTheme, {
  colors: {
    card: PaperLightTheme.colors.background,
    border: DefaultTheme.colors.border,
  },
});

export type AppTheme = typeof PaperLightTheme;
export const useAppTheme = () => useTheme<AppTheme>();
