import deepmerge from "deepmerge";
import { DefaultTheme as NavigationDefaultTheme } from "@react-navigation/native";
import { DefaultTheme as PaperDefaultTheme } from "react-native-paper";

const CustomTheme = {
  // Màu sắc chính của ứng dụng
  colors: {
    primary: "#6200ee",
    accent: "#03dac4",
    background: "#f6f6f6",
    surface: "#ffffff",
    text: "#000000",
    error: "#B00020",
    onBackground: "#000000",
    onSurface: "#000000",
    disabled: "#787878",
    placeholder: "#787878",
    backdrop: "rgba(0,0,0,0.5)",
    notification: "#f50057",
  },
  dark: false,
  // Custom fonts
  fonts: {
    regular: {
      fontFamily: "Roboto",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "Roboto-Medium",
      fontWeight: "500",
    },
    light: {
      fontFamily: "Roboto-Light",
      fontWeight: "300",
    },
    thin: {
      fontFamily: "Roboto-Thin",
      fontWeight: "100",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: 4,
};

const NavigationTheme = deepmerge(NavigationDefaultTheme, {
  colors: CustomTheme.colors,
});

const PaperTheme: typeof PaperDefaultTheme = deepmerge(PaperDefaultTheme, {
  ...CustomTheme,
  animation: {
    scale: 1.0,
  },
});
